const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const routes = require("./routes/route.js");
const cors = require("cors");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3000;

// initializing express
const app = express();

// middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", routes);

require("dotenv").config({
  path: path.join(__dirname, "./.env")
});

// connection to database
mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  error => {
    if (error) {
      console.error("Error:" + error);
    } else {
      console.log("Connection to Database Succeeded..");
    }
  }
);


app.listen(PORT, () => {
  console.log("Server is listening on Port:", PORT);
});
