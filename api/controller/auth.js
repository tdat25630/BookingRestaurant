const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const createError = require('../util/errorHandle');

const register = async (req, res, next) => {

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const existingUser = await User.find({ $or: [{ username: req.body.username }, { email: req.body.email }] });
    if (existingUser.length > 0) {
      next(createError(400, "Username or email already exists!"));
      return;
    }

    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,

    })

    await newUser.save();

    const formatedUser = res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }



}

const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(createError(404, "User with this email not found!"));
    }
    const password = await bcrypt.compare(req.body.password, user.password);
    if (!password) {
      return next(createError(400, "Wrong password !"));
    }

    // Tạo token với id và role
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Loại bỏ password từ user object trước khi trả về client
    const userWithoutPassword = { ...user._doc };
    delete userWithoutPassword.password;

    // Đặt cookie và trả về response
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true trong production
      sameSite: 'lax', // hoặc 'none' nếu API và client ở domain khác nhau
      maxAge: 24 * 60 * 60 * 1000 // 24 giờ
    }).status(200).json({
      ...userWithoutPassword,
      token // Gửi thêm token trong response body để frontend có thể lưu
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register, login
}