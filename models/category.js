const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
  category_name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
  },
  icon: {
    type: String,
  },
});

exports.Category = mongoose.model("Category", categorySchema);
