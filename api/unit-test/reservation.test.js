// __tests__/reservation.controller.test.js
const request = require('supertest');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const reservationController = require('../controller/reservationController');

jest.mock('../services/email.service');
jest.mock('../services/sms.service');
jest.mock('../util/cache');
jest.mock('../models/reservation');

const emailService = require('../services/email.service');
const smsService = require('../services/sms.service');
const cache = require('../util/cache');
const Reservation = require('../models/reservation');

app.use(bodyParser.json());
app.post('/booking-otp-email', reservationController.bookingOtpEmail);
app.post('/booking-otp-phone', reservationController.bookingOtpPhone);

// Test: bookingOtpEmail

describe('POST /booking-otp-email', () => {
  it('should generate OTP and store in cache, then send email', async () => {
    cache.set.mockImplementation(() => {});
    cache.get.mockReturnValue('123456');
    emailService.sendBookingConfirm.mockResolvedValue();

    const res = await request(app).post('/booking-otp-email').send({
      email: 'test@example.com',
      name: 'John Doe',
    });

    expect(res.statusCode).toBe(201);
    expect(emailService.sendBookingConfirm).toHaveBeenCalledWith({
      otp: expect.any(String),
      email: 'test@example.com',
      name: 'John Doe',
    });
  });

  it('should handle cache failure', async () => {
    cache.set.mockImplementation(() => {});
    cache.get.mockReturnValue(undefined);

    const res = await request(app).post('/booking-otp-email').send({
      email: 'fail@example.com',
      name: 'Jane Doe',
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Internal server error/);
  });
});

// Test: bookingOtpPhone

describe('POST /booking-otp-phone', () => {
  it('should validate phone and send OTP SMS', async () => {
    cache.set.mockImplementation(() => {});
    cache.get.mockReturnValue('654321');
    smsService.sendEsms.mockResolvedValue();

    const res = await request(app).post('/booking-otp-phone').send({
      phone: '0987654321',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(smsService.sendEsms).toHaveBeenCalledWith({
      phone: '0987654321',
      code: expect.any(String),
      requestId: expect.any(String),
    });
  });

  it('should return 400 for invalid phone', async () => {
    const res = await request(app).post('/booking-otp-phone').send({
      phone: 'abc',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/không hợp lệ/);
  });
});

// More tests should be created similarly for createReservation, getReservations, etc.
// You would mock Reservation model functions like Reservation.findById, .find, .create, etc.
// Add error handling tests and edge case tests as well
