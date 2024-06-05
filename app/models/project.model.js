const mongoose = require("mongoose");

const Project = mongoose.model(
    "Project",
    new mongoose.Schema({
        
        buildingname: { type: String },
        location: { type: String },
        address: { type: String },
        permit: { type: String },
        blueprint: { type: String },
        totalsquarefeet: { type: String },
        squarefeetprice: { type: String },
        othercost: { type: String },
        otherdescription: { type: String },
        totalprojectvalue: { type: String },
        suggestion: { type: String },
        remarks: { type: String },
        CUSTOMER_ID: { type: String },
        BUILDER_ID: { type: String },
        SUPPLIER_ID: { type: String },
        CONTRACTOR_ID: { type: String },
        startdate: { type: Date },
        enddate: { type: Date },
        extensiondate: { type: Date },
        projectStatus : { type: String},
        createdOn: { type: Date }
    })
);

module.exports = Project;

