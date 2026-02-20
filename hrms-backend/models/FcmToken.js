const mongoose = require("mongoose");

const fcmTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  token: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("FcmToken", fcmTokenSchema);
