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
        customerid: { type: String },
        builderid: { type: String },
        supplierid: { type: String },
        contractorid: { type: String },
        startdate: { type: Date },
        enddate: { type: Date },
        extensiondate: { type: Date }
    })
);

module.exports = Project;

