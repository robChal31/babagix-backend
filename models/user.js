const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    bio: { type: String },
    phone_number: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    location: {
      latitude: String,
      longitude: String,
    },
    avatar: {
      type: String,
      default: "userProfile.jpg",
    },
    itemSaved: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      },
    ],
    messages: [
      {
        type: Object,
      },
    ],
    verified: {
      type: Boolean,
      default: false,
    },
    verifyToken: {
      type: String,
    },
  },

  { timestamps: true }
);

exports.User = mongoose.model("User", userSchema);
// module.exports = mongoose.model("User", userSchema);
