// controllers/reservation.controller.js

const { validationResult } = require("express-validator");
const Reservation = require("../models/reservation");


// Create a new reservation
exports.createReservation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error("Bad request");
      err.status = 400; // note: use a number, not string
      err.errors = errors.array();
      throw err;
    }
    const reservation = new Reservation(req.body);
    await reservation.save();
    res.status(201).json(reservation);
  } catch (err) {
    throw err
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
