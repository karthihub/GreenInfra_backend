const mongoose = require("mongoose");

const Builder = mongoose.model(
  "Builder",
  new mongoose.Schema({
    usercode: { type: String },
    username: { type: String },
    mobile: { type: String },
    email: { type: String },
    password: { type: String },
    profile: { type: String },
    companyname: { type: String },
    companymobile: { type: String },
    companyemail: { type: String },
    officeaddress: { type: String },
    location: { type: String },
    roles: { type: String },
    accountstatus: { type: Boolean, default: true },
    Admin_ID: { type: String },
    createdOn: { type: Date}
    
  })
);

module.exports = Builder;
