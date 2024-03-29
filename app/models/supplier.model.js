const mongoose = require("mongoose");

const Supplier = mongoose.model(
    "Supplier",
    new mongoose.Schema({
        username: { type: String },
        mobile: { type: String },
        email: { type: String },
        password: { type: String },
        photo: { type: String },
        companyname: { type: String },
        companymobile: { type: String },
        companyemail: { type: String },
        officeaddress: { type: String },
        city: { type: String },
        state: { type: String },
        location: { type: String },
        roles: { type: String },
        date: { type: Date },
        accountstatus: { type: String, default: true },
        Build_ID: { type: String }
    })
);

module.exports = Supplier;  