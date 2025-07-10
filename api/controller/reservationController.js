// controllers/reservation.controller.js
const { validationResult } = require("express-validator");
const Reservation = require("../models/reservation");
const emailService = require('../services/email.service');
const sms = require("../services/sms.service");
const cache = require('../util/cache');
const crypto = require('crypto');

const OTP_TTL_SECONDS = 300; // 5 minutes
const OTP_LENGTH = 6;

function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

exports.bookingOtpEmail = async (req, res) => {
  try {
    const { email, name } = req.body;

    const selector = crypto.randomBytes(4).toString('hex');
    const otp = generateOTP(OTP_LENGTH);
    const key = `${email}:${selector}`;
    cache.set(key, otp, OTP_TTL_SECONDS);

    const checkCache = cache.get(key);
    if (!checkCache) {
      throw new Error("Cache failed to store OTP.");
    }

    await emailService.sendBookingConfirm({ otp, email, name });

    return res.status(201).json({ success: true, selector });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.bookingOtpPhone = async (req, res) => {
  try {
    const { phone } = req.body;

    const selector = crypto.randomBytes(4).toString('hex');
    const otp = generateOTP(OTP_LENGTH);
    const key = `${phone}:${selector}`;
    cache.set(key, otp, OTP_TTL_SECONDS);

    const checkCache = cache.get(key);
    if (!checkCache) {
      throw new Error("Cache failed to store OTP.");
    }

    await sms.sendSMS(["84364119018"], "Your OTP is 123456", 2, "");

    return res.status(201).json({ success: true, selector });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
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
      otp, selector, email, phone, specialRequest,
      name, reservationDate, reservationTime,
      guestCount, preOrders
    } = req.body;

    const identity = email || phone;
    //if (!identity || !selector) {
    //  return res.status(400).json({ message: "Missing identifier or selector." });
    //}

    const key = `${identity}:${selector}`;
    const storedOtp = cache.get(key);
    console.log('OTP check:', key, storedOtp);

    //if (!storedOtp) {
    //  return res.status(400).json({ message: "OTP expired or invalid." });
    //}

    //if (storedOtp != otp) {
    //  return res.status(400).json({ message: "Incorrect OTP." });
    //}

    cache.del(key);

    const reservation = new Reservation({
      guestCount,
      name,
      phone,
      reservationDate,
      reservationTime,
      specialRequest,
      preOrders
    });
    const newReservation = await reservation.save();

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

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reservations, total] = await Promise.all([
      Reservation.find(filters).skip(skip).limit(parseInt(limit)),
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
      err.status = 400; // note: use a number, not string
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
