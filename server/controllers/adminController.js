const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

exports.allowIfLoggedin =  (req, res, next) => {
    var token = req.headers["x-access-token"];
    if (!token) {
      res.status(401).json({ message: "You need to be logged in to access" });
    }
    jwt.verify(token, process.env.JWT_SECRET, function(err) {
      if (err) {
        res.status(500).json({ message: "failed to auth token" });
      }
      next();
    });
  };

exports.getUsers = async (req, res, next) => {
    const users = await User.find({});
    res.status(200).send({
      data: users
    });
  };
  
  exports.deleteUser = (req, res, next) => {
    User.findByIdAndRemove(req.params.id, (err,doc) => {
      if (err) {
        res.status(500).send();
      }
      res.status(200).send({
        data: doc,
        message: "User deleted successfully"
      });
    });
  };
  