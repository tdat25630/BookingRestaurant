const User = require("../models/user");


const getUsers = async (req,res,next) => {
  try {
    const users = await User.find();
    const formatedResponse = res.status(200).json(users);
  } catch (err) {
    next (err);
  }
}

module.exports = {
  getUsers
}