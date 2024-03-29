const path = require("path");
const bunyan = require("bunyan");
// const Mask = require("./mask.model");
// favour using env variables to provide your code with external configs
// it makes it a lot simpler when you want to change the configs
const level = process.env.NODE_LOGGING_LEVEL || "info";
var moment = require("moment");

var d = new Date();

// const d = new Date().toLocaleString('en-US', {
//   timeZone: 'Asia/Kolkata'
// });

var datestring = d.getDate()  + "_" + (d.getMonth()+1) + "_" + d.getFullYear();

// var datestring = moment().utcOffset("+05:30").format('DD_MM_YYYY');

const log = bunyan.createLogger({
  name: "NCC_Infra",
  streams: [
    {
      level,
      stream: process.stdout
    },
    {
      level,
      path: path.resolve(__dirname, "..", "..", "DailyLogs", datestring + "_logs.json")
    }
  ]
});

module.exports = log;