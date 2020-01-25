const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const jwtSecretKey = require("../config/jwt-secret-key");

router.post("/register", async (req, res, next) => {
  try {
    const user = new User(
      _.pick(req.body, ["name", "email", "password", "role"])
    );
    await user.save();
    const token = jwt.sign({ _id: user._id, role: user.role }, "secretkey");
    res
      .header("x-auth-header", token)
      .send(_.pick(user, ["name", "email", "password"]));
  } catch (ex) {
    res.status(401).send("User unable to get auth token::");
  }
});

module.exports = router;
