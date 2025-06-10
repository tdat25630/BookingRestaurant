const vnpayService = require('../services/vnpay.service');
const dateFormat = require('date-format');
const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const { calculateBill } = require('../services/invoiceService');

// Xem trước hóa đơn trước khi thanh toán
const previewInvoice = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const billDetails = await calculateBill(orderId);

        const populatedOrderItems = await OrderItem.find({ order_id: orderId }).populate('menu_item_id', 'name');

        res.status(200).json({
            success: true,
            data: {
                ...billDetails,
                orderItems: populatedOrderItems
            }
        });
    } catch (error) {
        console.error("Lỗi khi xem trước hóa đơn:", error);
        next(error);
    }
};

// Tạo URL thanh toán VNPAY
const createVnpayUrl = async (req, res, next) => {
    try {
        const { orderId } = req.body;
        const billDetails = await calculateBill(orderId);
        const amount = billDetails.total_amount;
        const returnUrl = 'http://localhost:8080/api/invoices/vnpay_return';

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Số tiền không hợp lệ.' });
        }

        const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const paymentUrl = await vnpayService.buildPaymentUrl({
            vnp_Amount: amount * 100,
            vnp_IpAddr: ipAddr,
            vnp_TxnRef: `${orderId}_${Date.now()}`,
            vnp_OrderInfo: `Thanh toán đơn hàng ${orderId}`,
            vnp_OrderType: 'other',
            vnp_ReturnUrl: returnUrl,
            vnp_Locale: 'vn',
            vnp_CreateDate: dateFormat(new Date(), 'yyyyMMddHHmmss'),
        });

        res.status(200).json({ success: true, data: { paymentUrl } });

    } catch (error) {
        console.error("Lỗi khi tạo URL VNPAY:", error);
        next(error);
    }
};

const handleVnpayReturn = (req, res, next) => {
    const isVerified = vnpayService.verifyReturnUrl(req.query);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    const { vnp_ResponseCode, vnp_TxnRef } = req.query;
    const orderId = vnp_TxnRef.split('_')[0];

    if (!isVerified) {
        return res.redirect(`${frontendUrl}/payment-result?status=failed&message=invalid_signature`);
    }

    if (vnp_ResponseCode === '00') {
        setTimeout(() => {
            res.redirect(`${frontendUrl}/payment-result?status=success&orderId=${orderId}`);
        }, 1000);
    } else {
        res.redirect(`${frontendUrl}/payment-result?status=failed&orderId=${orderId}&code=${vnp_ResponseCode}`);
    }
};
//xác nhận lại
const handleVnpayIpn = async (req, res, next) => {
    try {
        const isVerified = vnpayService.verifyIpnUrl(req.query);
        if (!isVerified) {
            return res.status(200).json({ code: '97', Message: 'Invalid Checksum' });
        }

        const { vnp_ResponseCode, vnp_TxnRef } = req.query;
        const orderId = vnp_TxnRef.split('_')[0];

        if (vnp_ResponseCode !== '00') {
            return res.status(200).json({ code: '01', Message: 'Transaction Failed' });
        }

        const existingInvoice = await Invoice.findOne({ order_id: orderId });
        if (existingInvoice) {
            return res.status(200).json({ code: '02', Message: 'Invoice Already Exists' });
        }

        const billDetails = await calculateBill(orderId);
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(200).json({ code: '03', Message: 'Order Not Found' });
        }

        const newInvoice = new Invoice({
            order_id: orderId,
            customer_id: order.customerId,
            total_amount: billDetails.total_amount,
            discount: billDetails.discount,
            tax_amount: billDetails.tax_amount,
            payment_method: 'qr_code',
            payment_status: 'paid'
        });

        await newInvoice.save();

        await Order.findByIdAndUpdate(orderId, {
            status: 'completed',
            total_amount: billDetails.total_amount
        });

        return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });

    } catch (error) {
        console.error("Lỗi IPN:", error);
        return res.status(200).json({ RspCode: '99', Message: 'Unknown Error' });
    }
};

module.exports = {
    previewInvoice,
    createVnpayUrl,
    handleVnpayReturn,
    handleVnpayIpn,
};
