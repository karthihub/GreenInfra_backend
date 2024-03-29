const mongoose = require("mongoose");

const Customer = mongoose.model(
  "Customer",
  new mongoose.Schema({
    name: { type: String },
    mobile: { type: String },
    email: { type: String },
    password: { type: String },
    photo: { type: String },
    accountstatus: { type: String },
    roles: { type: String },
    BUILD_ID: { type: String },
    date: { type: String }
  })
);

module.exports = Customer;