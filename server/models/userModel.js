const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "executive", "admin"]
  },
  accessToken: {
    type: String
  }
});

module.exports = mongoose.model("User", userSchema, "users");
