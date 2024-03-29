const mongoose = require("mongoose");

const Admin = mongoose.model(
  "Admin",
  new mongoose.Schema({
    usercode: String,
    password: String,
    accountstatus: Boolean,
    mobile: String,
    email: String,
    createdOn: Date,
    username: String,
    profile: String
  })
);

module.exports = Admin;
