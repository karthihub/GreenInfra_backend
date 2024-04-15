const mongoose = require("mongoose");

const Customer = mongoose.model(
  "Customer",
  new mongoose.Schema({
    usercode: { type: String },
    username: { type: String },
    dob: { type: String },
    mobile: { type: String },
    email: { type: String },
    address: { type: String},
    password: { type: String },
    profile: { type: String },
    accountstatus: { type: Boolean, default: true },
    roles: { type: String },
    BUILD_ID: { type: String },
    createdOn: { type: Date }
  })
);

module.exports = Customer;