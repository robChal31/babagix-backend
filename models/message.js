const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    room_name: {
      type: String,
      required: true,
    },
    chats: [
      {
        type: Object,
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
  },
  { timestamps: true }
);

exports.Message = mongoose.model("Message", messageSchema);
