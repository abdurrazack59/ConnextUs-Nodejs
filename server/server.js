const express = require("express");
const bodyParser = require("body-parser");
const api = require("./routes/api");
const cors = require("cors");
const dbURI = require("./config/db");
const mongoose = require("mongoose");
const PORT = require('./config/env');

// initializing express
const app = express();

// middlewares
app.use(cors());
app.use(bodyParser.json());
app.use("/api", api);

// connection to database
mongoose.connect(dbURI,{ useNewUrlParser: true, useUnifiedTopology: true },
  error => {
    if (error) {
      console.error("Error:" + error);
    } else {
      console.log("Connection to Database Succeeded..");
    }
  }
);

app.listen(PORT, () => {
  console.log("Server is running on port:" + PORT);
});
