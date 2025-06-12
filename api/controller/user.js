const User = require("../models/user");


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

module.exports = {
  getUsers,
  getUserById
}