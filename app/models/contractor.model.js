const mongoose = require("mongoose");

const Contractor = mongoose.model(
    "Contractor",
    new mongoose.Schema({
        usercode: { type: String },
        username: { type: String }, 
        mobile: { type: Number }, 
        email: { type: String }, 
        password: { type: String }, 
        profile: { type: String }, 
        address: { type: String },
        location: { type: String },
        accountstatus: { type: Boolean, default: true },
        roles: { type: String }, 
        BUILD_ID: { type: String }, 
        createdOn: { type: Date }
    })
);

module.exports = Contractor;

