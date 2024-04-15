const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.Admin = require("./admin.model");

db.Customer = require("./customer.model");
db.Builder = require("./builder.model");
db.Supplier = require("./supplier.model");
db.Contractor =  require("./contractor.model");

db.Project = require("./project.model");

// db.players = require("./players.model");

// db.playerfees = require("./playerfees.model");
// db.playerreport = require("./playerreport.model");
// db.Account = require("./account.model");


db.ROLES = ["admin"];

module.exports = db;