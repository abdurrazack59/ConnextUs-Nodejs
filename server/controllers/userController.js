const User = require("../models/userModel");
const roles = require("../roles");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");



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


async function validatePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

exports.signup = (req, res) => {
  let userData = req.body;
  let newUser = new User(userData);
  User.findOne({ email: userData.email }, (err, user) => {
    if (err) {
      console.log(err);
      res.send(err);
    }
    //if a user was found, that means the user's email matches the entered email
    if (user) {
      res.status(400).send({
        message: "This email has already been registered"
      });
    } else {
      bcrypt.hash(userData.password, 10, (err, hash) => {
        newUser.password = hash;
        newUser.save((err, registeredUser) => {
          if (err) {
            res.status(500).send("Error in registering new user");
          } else {
            res.status(200).send({
              data: registeredUser
            });
          }
        });
      });
    }
  });
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Email does not exist" });
    }
    const validPassword = await validatePassword(password, user.password);
    if (!validPassword) {
      res.status(422).json({ message: "Password is not correct" });
    }
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });
    await User.findByIdAndUpdate(user._id, { accessToken });
    res.status(200).json({
      data: { email: user.email, role: user.role },
      accessToken
    });
  } catch (error) {
    next(error);
  }
};

exports.getUser = (req, res) => {
  let email = req.params.email;
  User.findOne({ email: email }, (error, user) => {
    if (error) {
      res.status(404).send("User Not Found");
    } else {
      res.status(200).send(user);
    }
  });
};

exports.updateUserProfile = (req, res) => {
  var token = req.headers["x-access-token"];
  if (!token) {
    res.status(401).send({ auth: false, message: "No token provided" });
  }
  jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
    if (err) {
      res.status(500).send({ auth: false, message: "failed to auth token" });
    }
    User.findByIdAndUpdate(
      { _id: decoded.userId },
      req.body,
      (err, updatedUser) => {
        if (err) {
          res.send(err);
        } else {
          res.status(200).json({
            data: updatedUser,
            message: "User credentials have been updated"
          });
        }
      }
    );
  });
};

exports.getUsers = async (req, res, next) => {
  const users = await User.find({});
  res.status(200).send({
    data: users
  });
};

exports.updateUser = async (req, res, next) => {
  try {
    const update = req.body;
    const userId = req.params.userId;
    await User.findByIdAndUpdate(userId, update);
    const user = await User.findById(userId);
    res.status(200).json({
      data: user,
      message: "User has been updated"
    });
  } catch (error) {
    next(error);
  }
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

