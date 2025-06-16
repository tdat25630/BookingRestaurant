// utils/sendEmail.ts
const nodemailer = require('nodemailer');

exports.sendEmail = async ({
  to,
  subject,
  html,
}) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,        // your-email@gmail.com
      pass: process.env.EMAIL_PASS,        // App Password from Google
    },
  });

  const mailOptions = {
    from: `"No Joke Restaurant" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
}

