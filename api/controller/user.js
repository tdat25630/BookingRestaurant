const User = require("../models/user");
const createError = require("../util/errorHandle");


const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password -__v");
    const formatedResponse = res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password -__v");
    if (!user) {
      return next(createError(404, "User not found!"));
    }
    const formatedRes = res.status(200).json(user)
  } catch (err) {
    next(err);
  }
}

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, {
      $set: req.body
    }, { new: true }).select("-password -__v");

    if (!user) {
      return next(createError(404, "User not found!"));
    }

    const formatedResponse = res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

const getUsersByName = async (req, res, next) => {
  try {
    const users = await User.find({
      name: { $regex: req.query.name, $options: "i" }
    }).select("-password -__v");
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}

const getUsersByRole = async (req, res, next) => {
  try {
    const users = await User.find({
      role: req.query.role
    }).select("-password -__v");
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  getUsersByName,
  getUsersByRole
}