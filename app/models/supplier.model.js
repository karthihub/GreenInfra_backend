const mongoose = require("mongoose");

const Supplier = mongoose.model(
    "Supplier",
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
        city: { type: String },
        state: { type: String },
        location: { type: String },
        roles: { type: String },
        createdOn: { type: Date },
        accountstatus: { type: Boolean, default: true },
        Build_ID: { type: String },
    
    })
);

module.exports = Supplier;  




