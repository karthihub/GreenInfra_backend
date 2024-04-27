
const mongoose = require("mongoose");

const Task = mongoose.model(
    "Task",
    new mongoose.Schema({

        task : { type: String },
        remarks : { type: String },
        progress : { type: Number },
        price : { type: Number },
        updateOn : { type: Date },
        createdOn : { type: Date },
        accountstatus : { type: Boolean, default: true },
        BUILDER_ID : { type: String},
        SUPPLIER_ID : { type: String },
    
    })
);

module.exports = Task;  




