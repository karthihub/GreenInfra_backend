
const mongoose = require("mongoose");

const Material = mongoose.model(
    "Material",
    new mongoose.Schema({

        materialname : { type: String },
        type : { type: String },
        quantity : { type: Number },
        price : { type: Number },

        location : { type: String },

        createdOn : { type: Date },
        accountstatus : { type: Boolean, default: true },

        SUPPLIER_ID : { type: String },
    
    })
);

module.exports = Material;  




