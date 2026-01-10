const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true },
  name: String,
  email: String,
  photo: String,
  status: { type: String, default: "Available" },
  lastSeen: Date
});

module.exports = mongoose.model("User", userSchema);
