const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.allowIfLoggedin = (req, res, next) => {
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
      data: {_id:user._id, email: user.email, role: user.role },
      accessToken
    });
  } catch (error) {
    next(error);
  }
};

exports.getUser = (req, res) => {
  let id = req.params.id;
  User.findOne({ _id: id }, (error, user) => {
    if (error) {
      res.status(404).send("User Not Found");
    } else {
      res.status(200).send(user);
    }
  });
};

exports.updateUserProfile = (req, res) => {
  User.findByIdAndUpdate(req.params.id,req.body,(err, updatedUser) => {
      if (err) {
        res.send({
          message: "Error in updating user details"
        });
      } else {
        res.status(200).json({
          data: updatedUser,
          message: "User credentials have been updated"
        });
      }
    }
  );
};
