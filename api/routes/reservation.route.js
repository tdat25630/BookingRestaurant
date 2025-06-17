const express = require('express')
const router = express.Router();
const reservationController = require('../controller/reservationController');
const { body, param, validationResult } = require('express-validator');

const validationHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

router.post('/', [
  body('phone').matches(/^\+?[0-9]{7,14}$/),
  body('name').isString().notEmpty(),
  body('reservationDate').isDate(),
  body('reservationTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  body('guestCount').isInt({ min: 1 }),
],
  reservationController.createReservation);

router.put('/:id', [
  param('id').isMongoId().optional().withMessage('Invalid reservation ID'),
  body('phone').matches(/^\+?[1-9][0-9]{7,14}$/).optional().withMessage('Invalid phone number'),
  body('name').isString().notEmpty().optional().withMessage('Name is required'),
  body('reservationDate').isDate().optional().withMessage('Invalid reservation date'),
  body('reservationTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().withMessage('Invalid time format'),
  body('guestCount').isInt({ min: 1 }).optional().withMessage('Guest count must be at least 1'),
], 
  validationHandler,
  reservationController.updateReservation);

router.get('/', reservationController.getReservations);

router.delete('/:id', [
  param('id').isMongoId()
], reservationController.deleteReservation);

module.exports = router;
