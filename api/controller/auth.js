const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const createError = require('../util/errorHandle');

const register = async (req, res, next) => {

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

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

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

    const formatedResponse = res.cookie("access_token", token, {
      httpOnly: true,
    }).status(200).json(user)
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register, login
}