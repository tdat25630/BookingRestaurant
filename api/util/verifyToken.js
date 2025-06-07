const jwt = require('jsonwebtoken');
const createError = require('./errorHandle');


const verifyToken = (req,res,next) => {
  const token = req.cookies.access_token;
  jwt.verify(token, process.env.JWT_SECRET, (err,user)=> {
    if(err){
      return next(createError(403, "Token is not valid!"));
    }
    req.hello = user;
    next()
  });
}

const verifyUser = (req,res,next) => {
  verifyToken(req,res, () => {
    if(req.hello.id == req.params.id || req.hello.role == 'admin'){
      next();
    }else{
      return next(createError(403, "You are not authorized!"));

    }

  })
}

const verifyAdmin = (req,res,next) => {
  verifyToken(req,res, () => {
    if(req.hello.role =='admin'){
      next();
    }else{
      return next(createError(403, "You are not authorized!"));
    }
  })
}

module.exports = {
  verifyToken,
  verifyUser,
  verifyAdmin
}