const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const Nexmo = require("nexmo");

exports.allowIfLoggedin = (req, res ,next) => {
  var token = req.headers["x-access-token"];
  if (!token) {
    return res
      .status(401)
      .send({ message: "You need to be logged in to access" });
  }
  jwt.verify(token, process.env.JWT_SECRET, function(err) {
    if (err) {
      return res.status(500).send({ message: "failed to auth token" });
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
      res.status(409).send({
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
      res.status(401).send({ message: "Email does not exist" });
    }
    const validPassword = await validatePassword(password, user.password);
    if (!validPassword) {
      res.status(422).send({ message: "Password is not correct" });
    }
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });
    await User.findByIdAndUpdate(user._id, { accessToken });
    res.status(200).send({
      data: { _id: user._id, email: user.email, role: user.role },
      accessToken
    });
  } catch (error) {
    next(error);
  }
};

exports.getUser = (req, res) => {
  let id = req.params.id;
  User.findOne({ _id: id }, (err, user) => {
    if (err) {
     return res.status(404).send({
       message: "User Not Found"
     });
    } else {
      res.status(200).send(user);
    }
  });
};

exports.updateUserProfile = (req, res) => {
  id = req.params.id;
  update = req.body;
  User.findByIdAndUpdate(id, update, (err) => {
    if (err) {
     return res.send({
        message: "Error in updating user details"
      });
    } else {
      User.findById(id, (err, updatedUser) => {
        res.status(200).send({
          message: "User credentials have been updated",
          data: updatedUser
        });
      });
    }
  });
};

exports.sendEmail = (req, res) => {
  let email = req.body.email;
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.AUTH_EMAIL_ID,
      pass: process.env.AUTH_EMAIL_PASSWORD
    }
  });

  var mailOptions = {
    from: process.env.AUTH_EMAIL_ID,
    to: email,
    subject: "Sending Email using Node.js",
    text: `Hi,
This email was sent by nodemailer which is package used to send mails using node js.`
    // html: '<h1>Hi Smartherd</h1><p>Your Messsage</p>'
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(error);
      res.status(500).send({
        message: "Internal server error"
      });
    } else {
      console.log("Email sent: " + info.response);
      res.send({
        message: `Email has been sent to ${req.body.email}`
        // data: info.response
      });
    }
  });
};

exports.sendOtp = (req, res) => {
  const nexmo = new Nexmo({
    apiKey: process.env.NEXMO_API_KEY,
    apiSecret: process.env.NEXMO_API_SECRET
  });

  let mobilenumber = req.body.mobilenumber;

  nexmo.verify.request(
    { number: mobilenumber, brand: process.env.NEXMO_BRAND_NAME },
    (err, result) => {
      if (err) {
        res.status(500).send({
          message: "Internal server error"
        });
      } else {
        let requestId = result.request_id;
        if (result.status == "0") {
          res.send({
            requestId: requestId,
            message: "Success sending OTP"
          });
        } else {
          res.status(401).send(result.error_text);
        }
      }
    }
  );
};

exports.verifyOtp = (req, res) => {
  const nexmo = new Nexmo({
    apiKey: process.env.NEXMO_API_KEY,
    apiSecret: process.env.NEXMO_API_SECRET
  });

  let pin = req.body.pin;
  let requestId = req.body.requestId;

  nexmo.verify.check({ request_id: requestId, code: pin }, (err, result) => {
    if (err) {
      res.send(err);
    } else {
      if (result && result.status == "0") {
        res.status(200).send({ message: "Account verified" });
      } else {
        res.status(401).send({ message: "Unverified account" });
      }
    }
  });
};
