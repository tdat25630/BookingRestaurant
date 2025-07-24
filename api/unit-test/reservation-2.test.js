const request = require('supertest');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Reservation = require('../models/reservation'); // your model
const { updateReservation } = require('../controller/reservationController'); // your controller

jest.mock('../models/reservation'); // Mock the model

app.use(express.json());
app.put('/reservations/:id', updateReservation);

describe('PUT /reservations/:id', () => {
  const mockId = new mongoose.Types.ObjectId().toHexString();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update reservation successfully', async () => {
    const updatedData = {
      name: 'John Doe',
      reservationDate: new Date(),
      reservationTime: '18:30',
      guestCount: 4
    };

    const mockReservation = { _id: mockId, ...updatedData };

    Reservation.findByIdAndUpdate.mockResolvedValue(mockReservation);

    const res = await request(app)
      .put(`/reservations/${mockId}`)
      .send(updatedData);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('John Doe');
    expect(Reservation.findByIdAndUpdate).toHaveBeenCalledWith(
      mockId,
      updatedData,
      { new: true, runValidators: true }
    );
  });

  it('should return 404 if reservation not found', async () => {
    Reservation.findByIdAndUpdate.mockResolvedValue(null);

    const res = await request(app)
      .put(`/reservations/${mockId}`)
      .send({ name: 'Not Exist' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Reservation not found');
  });

  it('should return 400 on validation error (invalid time)', async () => {
    const invalidData = {
      reservationTime: '25:00' // invalid time
    };

    Reservation.findByIdAndUpdate.mockImplementation(() => {
      const error = new Error('25:00 is not a valid time format (HH:mm)');
      throw error;
    });

    const res = await request(app)
      .put(`/reservations/${mockId}`)
      .send(invalidData);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/not a valid time format/i);
  });

  it('should handle database errors gracefully', async () => {
    Reservation.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

    const res = await request(app)
      .put(`/reservations/${mockId}`)
      .send({ name: 'Crash' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Database error');
  });
});
