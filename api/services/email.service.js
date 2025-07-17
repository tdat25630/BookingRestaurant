const emailUtil = require('../util/send-mail.util');
const { bookingConfirmationEmail } = require('../assets/email-templates/booking-confirmation');

exports.sendBookingConfirm = async ({ email, name, otp }) => {
  try {
    await emailUtil.sendEmail({
      to: email,
      subject: "Xác nhận đặt bàn",
      html: bookingConfirmationEmail({ otp, customerName: name }),
    });
  } catch (error) {
    console.error('Failed to send booking confirmation:', error);
  }
};
