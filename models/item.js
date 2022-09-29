const mongoose = require("mongoose");

const itemSchema = mongoose.Schema(
  {
    item_name: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    location: {
      type: {
        type: String,
      },
      coordinates: [],
    },
    item_pics: [
      {
        type: Object,
      },
    ],
    loved: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    desc: {
      type: String,
      required: true,
    },
    is_free: {
      type: Number,
      required: true,
    },
    expired: {
      type: Boolean,
      default: false,
    },
    expired_date: {
      type: Number,
    },
  },
  { timestamps: true }
);

itemSchema.index({ location: "2dsphere" });

exports.Item = mongoose.model("Item", itemSchema);
