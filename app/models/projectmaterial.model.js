
const mongoose = require("mongoose");

const ProjectMaterial = mongoose.model(
    "ProjectMaterial",
    new mongoose.Schema({

        materialname : { type: String },
        type : { type: String },
        quantity : { type: Number },
        price : { type: Number },

        location : { type: String },

        createdOn : { type: Date },
        accountstatus : { type: Boolean, default: true },

        SUPPLIER_ID : { type: Array },
        PROJECT_ID : { type : String}
    
    })
);

module.exports = ProjectMaterial;  




