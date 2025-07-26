// controllers/reservation.controller.js
const { validationResult } = require("express-validator");
const Reservation = require("../models/reservation");
const emailService = require('../services/email.service');
const sms = require("../services/sms.service");
const cache = require('../util/cache');
const crypto = require('crypto');
const mongoose = require('mongoose');

//const OTP_TTL_SECONDS = 300; // 5 minutes
const OTP_LENGTH = 6;

function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

const OTP_TTL_SECONDS = 300; // OTP valid for 5 minutes
const RATE_LIMIT_WINDOW_SECONDS = 300; // 5-minute rate limit window
const MAX_REQUESTS = 2;

exports.bookingOtpEmail = async (req, res) => {
  try {
    const { email, name } = req.body;

    const rateLimitKey = `otp-requests-${email}`;
    const now = Date.now();
    let requestData = cache.get(rateLimitKey);

    if (requestData) {
      if (now > requestData.expiresAt) {
        // Window expired → reset
        requestData = { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_SECONDS * 1000 };
      } else if (requestData.count >= MAX_REQUESTS) {
        return res.status(429).json({
          success: false,
          message: "You can only request OTP twice every 5 minutes.",
        });
      } else {
        // Still in window and under limit
        requestData.count += 1;
      }
    } else {
      // First request
      requestData = { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_SECONDS * 1000 };
    }

    // Set rate limit data with proper TTL
    const ttl = Math.ceil((requestData.expiresAt - now) / 1000);
    cache.set(rateLimitKey, requestData, ttl);

    // Generate OTP
    const otp = generateOTP(OTP_LENGTH);
    const otpKey = `otp-${email}`;
    cache.set(otpKey, otp, OTP_TTL_SECONDS);

    if (!cache.get(otpKey)) {
      throw new Error("Cache failed to store OTP.");
    }

    console.log(`OTP for ${email}:`, otp);
    await emailService.sendBookingConfirm({ otp, email, name });

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};


exports.bookingOtpPhone = async (req, res) => {
  try {
    const { phone } = req.body;

    // Basic validation
    if (!phone || typeof phone !== 'string' || !/^\d{9,15}$/.test(phone)) {
      return res.status(400).json({ message: 'Số điện thoại không hợp lệ.' });
    }

    // Generate OTP
    const otp = generateOTP(OTP_LENGTH);

    // Save to cache
    cache.set(phone, otp, OTP_TTL_SECONDS);

    const checkCache = cache.get(phone);
    if (!checkCache) {
      throw new Error('Lưu OTP vào bộ nhớ đệm thất bại.');
    }

    console.log(`OTP for ${phone}: ${otp}`);

    const requestId = crypto.randomBytes(4).toString('hex');

    await sms.sendEsms({
      phone,
      code: otp,
      requestId
    });

    return res.status(201).json({ success: true, message: 'OTP đã được gửi.' });

  } catch (error) {
    console.error('Error sending OTP:', error.message);
    return res.status(500).json({ message: 'Lỗi máy chủ khi gửi OTP.' });
  }
};

exports.createReservation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed.",
        errors: errors.array(),
      });
    }

    const {
      otp, otpTarget, email, phone, specialRequest,
      name, reservationDate, reservationTime,
      guestCount, preOrders, accountId
    } = req.body;

    const identity = otpTarget == 'email' ? email : phone;

    const key = identity;
    const storedOtp = cache.get(key);
    console.log('OTP check:', key, storedOtp);

    if (!storedOtp) {
      return res.status(400).json({ message: "OTP expired or invalid." });
    }

    if (storedOtp != otp) {
      return res.status(400).json({ message: "Incorrect OTP." });
    }

    cache.del(key);

    const newReservation = new Reservation({
      name,
      phone: phone || null,
      email: email || null,
      reservationDate,
      reservationTime,
      guestCount,
      specialRequest,
      userId: accountId || null, // Lưu userId nếu có
      preOrders: preOrders || [],
      status: 'pending'
    });

    const reservation = new Reservation({
      guestCount,
      name,
      phone,
      email,
      reservationDate,
      reservationTime,
      specialRequest,
      preOrders,
    });
    if (accountId && mongoose.Types.ObjectId.isValid(accountId.trim())) {
      reservation.accountId = accountId;
    }

    await newReservation.save();

    return res.status(201).json(newReservation);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Get all reservations
exports.getReservations = async (req, res) => {
  try {
    const {
      phone,
      name,
      reservationDate,
      startTime,
      endTime,
      guestCount,
      status,
      specialRequest,
      page = 1,
      limit = 10,
    } = req.query;

    const filters = {};

    if (phone) {
      filters.phone = { $regex: phone, $options: 'i' };
    }
    if (name) {
      filters.name = { $regex: name, $options: 'i' };
    }
    if (specialRequest) {
      filters.specialRequest = { $regex: specialRequest, $options: 'i' };
    }
    if (status) {
      filters.status = status;
    }
    if (reservationDate) filters.reservationDate = reservationDate;
    if (guestCount) filters.guestCount = parseInt(guestCount);

    if (startTime || endTime) {
      filters.reservationTime = {};
      if (startTime) filters.reservationTime.$gte = startTime;
      if (endTime) filters.reservationTime.$lte = endTime;
    }
    console.log(filters)

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reservations, total] = await Promise.all([
      Reservation.find(filters).skip(skip).limit(parseInt(limit))
        .sort({ reservationDate: -1 })
        .populate('preOrders.itemId'),
      Reservation.countDocuments(filters)
    ]);

    res.status(200).json({
      total,
      page: parseInt(page),
      pageSize: reservations.length,
      totalPages: Math.ceil(total / limit),
      reservations
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single reservation by ID
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('customerId');
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
    res.status(200).json(reservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a reservation
exports.updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
    res.status(200).json(reservation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a reservation
exports.deleteReservation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error("Bad request");
      err.status = 400;
      err.errors = errors.array();
      throw err;
    }
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
    res.status(200).json({ message: 'Reservation deleted successfully' });
  } catch (err) {
    throw err
  }
};
