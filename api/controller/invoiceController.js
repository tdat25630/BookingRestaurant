const axios = require('axios').default;
const CryptoJS = require('crypto-js');
const moment = require('moment');
const qs = require('qs'); // Thư viện để format data cho status check
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');

// Cấu hình ZaloPay, lấy thông tin từ file .env
const config = {
  app_id: process.env.ZALOPAY_APP_ID || "2553",
  key1: process.env.ZALOPAY_KEY1 || "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
  key2: process.env.ZALOPAY_KEY2 || "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
  endpoint_create: 'https://sb-openapi.zalopay.vn/v2/create',
  endpoint_query: 'https://sb-openapi.zalopay.vn/v2/query',
  endpoint_getbanks: 'https://sbgateway.zalopay.vn/api/getlistmerchantbanks',
};

/**
 * Hàm hỗ trợ tính toán lại hóa đơn.
 */
const calculateBillFromItems = async (orderId) => {
    const items = await OrderItem.find({ orderId: orderId });
    if (!items || items.length === 0) {
        throw new Error('Đơn hàng không có sản phẩm.');
    }
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return totalAmount;
};


/**
 * @desc Tạo một đơn hàng mới trên ZaloPay.
 * @route POST /api/zalopay/create-order
 */
exports.createZaloPayOrder = async (req, res, next) => {
    try {
        const { orderId, bankCode } = req.body;
        if (!orderId) {
            return res.status(400).json({ success: false, message: 'Thiếu orderId.' });
        }

        const amount = await calculateBillFromItems(orderId);
        if (amount <= 0) {
            return res.status(400).json({ success: false, message: 'Đơn hàng không có giá trị.' });
        }

        const embed_data = {
            redirecturl: `${process.env.FRONTEND_URL}/payment-result`
        };

        const unique_suffix = Date.now().toString().slice(-6);
        const app_trans_id = `${moment().format('YYMMDD')}_${orderId}_${unique_suffix}`;

        const order_request = {
            app_id: config.app_id,
            app_trans_id: app_trans_id,
            app_user: 'user123',
            app_time: Date.now(),
            item: JSON.stringify([]), // Theo mẫu ZaloPay, trường này có thể rỗng
            embed_data: JSON.stringify(embed_data),
            amount: amount,
            description: `Thanh toán cho đơn hàng #${orderId}`,
            bank_code: bankCode || '',
            callback_url: `${process.env.APP_URL}/api/zalopay/callback`,
        };

        const data = `${config.app_id}|${order_request.app_trans_id}|${order_request.app_user}|${order_request.amount}|${order_request.app_time}|${order_request.embed_data}|${order_request.item}`;
        order_request.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

        const result = await axios.post(config.endpoint_create, null, { params: order_request });
        
        res.status(200).json({ 
            success: true, 
            zaloPayResponse: result.data,
            app_trans_id: app_trans_id 
        });

    } catch (error) {
        console.error("Lỗi khi tạo đơn hàng ZaloPay:", error);
        next(error);
    }
};

/**
 * @desc Xử lý callback từ ZaloPay Server.
 * @route POST /api/zalopay/callback
 */
exports.handleZaloPayCallback = async (req, res, next) => {
    const result = {};
    try {
        const { data: dataStr, mac } = req.body;
        const calculatedMac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();

        if (calculatedMac !== mac) {
            result.return_code = -1;
            result.return_message = 'mac not equal';
        } else {
            const dataJson = JSON.parse(dataStr);
            const app_trans_id = dataJson['app_trans_id'];
            const orderId = app_trans_id.split('_')[1];

            const order = await Order.findById(orderId);
            if (order && order.paymentStatus !== 'paid') {
                await Order.findByIdAndUpdate(orderId, {
                    paymentStatus: 'paid',
                    status: 'served',
                });
            }
            
            result.return_code = 1;
            result.return_message = 'success';
        }
    } catch (ex) {
        console.error("Lỗi ZaloPay Callback:", ex);
        result.return_code = 0;
        result.return_message = ex.message;
    }
    
    res.json(result);
};

/**
 * @desc Kiểm tra trạng thái đơn hàng (dành cho frontend polling).
 * @route POST /api/zalopay/status
 */
exports.checkZaloPayOrderStatus = async (req, res, next) => {
    try {
        const { app_trans_id } = req.body;
        if (!app_trans_id) {
            return res.status(400).json({ success: false, message: 'Thiếu app_trans_id.' });
        }

        const postData = {
            app_id: config.app_id,
            app_trans_id,
        };

        const data = `${config.app_id}|${postData.app_trans_id}|${config.key1}`;
        postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

        // CẬP NHẬT: Sử dụng đúng cấu hình request như trong code mẫu
        const postConfig = {
            method: 'post',
            url: config.endpoint_query,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: qs.stringify(postData),
        };

        const result = await axios(postConfig);

        // Giữ lại logic kiểm tra trong DB của mình
        const orderId = app_trans_id.split('_')[1];
        const ourOrder = await Order.findById(orderId).select('paymentStatus');

        res.status(200).json({
            success: true,
            zaloPayStatus: result.data,
            ourDbStatus: ourOrder ? ourOrder.paymentStatus : 'not_found'
        });
    } catch (error) {
        console.error("Lỗi kiểm tra trạng thái ZaloPay:", error);
        next(error);
    }
};

/**
 * @desc Lấy danh sách ngân hàng được ZaloPay hỗ trợ.
 * @route GET /api/zalopay/banks
 */
exports.getListBanks = async (req, res, next) => {
    try {
        const reqtime = Date.now();
        const params = {
            appid: config.app_id,
            reqtime: reqtime,
            mac: CryptoJS.HmacSHA256(config.app_id + "|" + reqtime, config.key1).toString()
        };
        const result = await axios.get(config.endpoint_getbanks, { params });
        res.status(200).json(result.data);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách ngân hàng:", error);
        next(error);
    }
};

