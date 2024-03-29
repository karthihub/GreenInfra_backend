const mongoose = require("mongoose");

const Builder = mongoose.model(
  "Builder",
  new mongoose.Schema({
    username: { type: String },
    mobile: { type: String },
    email: { type: String },
    password: { type: String },
    photo: { type: String },
    companyname: { type: String },
    companymobile: { type: String },
    companyemail: { type: String },
    officeaddress: String,
    location: { type: String },
    roles: { type: String },
    date: { type: Date },
    accountstatus: { type: String, default: true },
    Admin_ID: { type: String },
  })
);

module.exports = Builder;
