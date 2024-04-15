const mongoose = require("mongoose");

const Admin = mongoose.model(
  "Admin",
  new mongoose.Schema({
    usercode: String,
    password: String,
    accountstatus: { type: Boolean, default: true },
    mobile: String,
    email: String,
    createdOn: Date,
    username: String,
    profile: String,
    roles: String
  })
);

module.exports = Admin;
