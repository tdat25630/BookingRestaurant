const Invoice = require('../models/invoice');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const { VNPay } = require('vnpay');
/**
 * Tính toán hóa đơn từ orderId
 */
const calculateBill = async (orderId) => {
    const orderItems = await OrderItem.find({ orderId: orderId });

    if (!orderItems || orderItems.length === 0) {
        return {
            orderItems: [],
            subTotal: 0,
            discount: 0,
            taxAmount: 0,
            totalAmount: 0
        };
    }

    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return {
        orderItems,
        subTotal: totalAmount,
        discount: 0,
        taxAmount: 0,
        totalAmount: totalAmount
    };
};


// Xem trước hóa đơn
exports.previewInvoice = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
        }

        const billDetails = await calculateBill(orderId);

        const populatedOrderItems = await OrderItem.find({ orderId: orderId })
            .populate('menuItemId', 'name price')
            .lean();

        res.status(200).json({
            success: true,
            data: {
                order,
                items: populatedOrderItems,
                summary: {
                    subTotal: billDetails.subTotal,
                    discount: billDetails.discount,
                    taxAmount: billDetails.taxAmount,
                    totalAmount: billDetails.totalAmount,
                }
            }
        });
    } catch (error) {
        console.error("Lỗi khi xem trước hóa đơn:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ khi xem trước hóa đơn", error: error.message });
    }
};

// Tạo URL thanh toán VNPAY
exports.createVnpayUrl = async (req, res, next) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu mã đơn hàng (orderId).'
            });
        }

        const billDetails = await calculateBill(orderId);
        const amount = billDetails.totalAmount;

        // FIX: Kiểm tra số tiền hợp lệ sau khi đã gọi calculateBill
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Đơn hàng trống hoặc không có giá trị để thanh toán.'
            });
        }

        const vnpay = new VNPay({
            tmnCode: process.env.VNP_TMN_CODE,
            secureSecret: process.env.VNP_HASH_SECRET,
            vnpayHost: 'https://sandbox.vnpayment.vn',
            hashAlgorithm: 'SHA512',
        });

        // ...
        const createDate = new Date();
        const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-result`;

        const yyyy = createDate.getFullYear();
        const mm = String(createDate.getMonth() + 1).padStart(2, '0'); 
        const dd = String(createDate.getDate()).padStart(2, '0'); 
        const HH = String(createDate.getHours()).padStart(2, '0'); 
        const MM = String(createDate.getMinutes()).padStart(2, '0'); 
        const ss = String(createDate.getSeconds()).padStart(2, '0'); 
        const vnpCreateDate = `${yyyy}${mm}${dd}${HH}${MM}${ss}`;


        const paymentUrl = await vnpay.buildPaymentUrl({
            vnp_Amount: amount * 100,
            vnp_IpAddr: ipAddr,
            vnp_TxnRef: `${orderId}_${Date.now()}`,
            vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
            vnp_OrderType: 'other',
            vnp_ReturnUrl: returnUrl,
            vnp_Locale: 'vn',
            vnp_CreateDate: vnpCreateDate,
        });
        // ...
        res.status(200).json({ success: true, data: { paymentUrl } });

    } catch (error) {
        console.error(" Lỗi khi tạo URL VNPAY:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ khi tạo URL thanh toán", error: error.message });
    }
};

// Xử lý khi VNPAY gọi về (IPN - Instant Payment Notification)
exports.handleVnpayIpn = async (req, res, next) => {
    try {
        const { vnp_ResponseCode, vnp_TxnRef } = req.query;
        const orderId = vnp_TxnRef.split('_')[0];

        if (vnp_ResponseCode !== '00') {
            return res.status(200).json({ RspCode: '01', Message: 'Transaction Failed' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(200).json({ RspCode: '03', Message: 'Order Not Found' });
        }

        if (order.paymentStatus === 'paid') {
            return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
        }

        const billDetails = await calculateBill(orderId);

        const newInvoice = new Invoice({
            order_id: orderId,
            total_amount: billDetails.totalAmount,
            discount: billDetails.discount,
            tax_amount: billDetails.taxAmount,
            payment_method: 'vnpay_qr',
            payment_status: 'paid'
        });
        await newInvoice.save();

        await Order.findByIdAndUpdate(orderId, {
            status: 'served',
            paymentStatus: 'paid'
        });

        return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });

    } catch (error) {
        console.error("Lỗi IPN:", error);
        // Trả về mã lỗi cho VNPAY biết là có lỗi xảy ra
        return res.status(200).json({ RspCode: '99', Message: 'Unknown Error' });
    }
};

// Xử lý khi người dùng được VNPAY điều hướng về
exports.handleVnpayReturn = (req, res, next) => {

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const { vnp_ResponseCode, vnp_TxnRef, ...restParams } = req.query;
    const orderId = vnp_TxnRef.split('_')[0];
    const queryString = new URLSearchParams(restParams).toString();

    if (vnp_ResponseCode === '00') {
        res.redirect(`${frontendUrl}/payment-result?status=success&orderId=${orderId}&${queryString}`);
    } else {
        res.redirect(`${frontendUrl}/payment-result?status=failed&orderId=${orderId}&code=${vnp_ResponseCode}`);
    }
};