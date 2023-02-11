const mongoose = require("mongoose");
const Schema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "The title is required."],
    minlength: [8, "too short"],
    // custom validation
    validate: {
      validator: function (v) {
        return v.length == 10;
      },
      message: (data) => `${data.value} is not a valid title.`,
    },
  },
  price: {
    type: Number,
    min: [10, "Must be at least 10, got {VALUE}"],
    max: [200],
  },
  phone: {
    type: String,
    validate: {
      validator: function (v) {
        return /\d{3}-\d{3}-\d{4}/.test(v);
      },
      message: (data) => `${data.value} is not a standard format`,
    },
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
exports.schema = Schema;
