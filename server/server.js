const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const path = require("path");
const routes = require("./routes/route.js");
const User = require("./models/userModel");
const cors = require("cors");
const dbURI = require("./config/db");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3000;

// initializing express
const app = express();

// middlewares
app.use(cors());
app.use(bodyParser.json());
app.use("/api", routes);

require("dotenv").config({
  path: path.join(__dirname, "./.env")
});

// connection to database
mongoose.connect(
  dbURI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  error => {
    if (error) {
      console.error("Error:" + error);
    } else {
      console.log("Connection to Database Succeeded..");
    }
  }
);

// app.listen(PORT, () => {
//   console.log("Server is running on port:" + PORT);
// });

app.use(async (req, res, next) => {
  if (req.headers["x-access-token"]) {
    const accessToken = req.headers["x-access-token"];
    const { userId, exp } = await jwt.verify(
      accessToken,
      process.env.JWT_SECRET
    );
    // Check if token has expired
    if (exp < Date.now().valueOf() / 1000) {
      return res.status(401).json({
          error: "JWT token has expired, please login to obtain a new one"
        });
    }
    res.locals.loggedInUser = await User.findById(userId);
    next();
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log("Server is listening on Port:", PORT);
});
