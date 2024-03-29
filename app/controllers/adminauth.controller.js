
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var moment = require("moment");
const dbConfig = require("../config/db.config");
const { spawn } = require('child_process');
const path = require("path");

const logger = require("../models/logger.model");
const config = require("../config/auth.config");
const sendNotification = require("../cronscript/sendPushnotification");
const sendEmailNotification = require("../cronscript/sendEmailNotification");

const db = require("../models");
const Admin = db.Admin;
const Customer = db.Customer;
const Builder = db.Builder;
const Vendor = db.Vendor;
const SubContractor = db.SubContractor

const Supplier = db.Supplier;
const Project = db.Project;


const mongoose = require("mongoose");
const Account = db.Account;

function generateCode(length) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let retVal = '';
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n)).toUpperCase();
  }
  return retVal;
}


//Admin Login
exports.AdminLogin = (req, res) => {

  console.log(req.body);

  Admin.findOne({ usercode: req.body.usercode })
    .exec() 
    .then(user => {

      if (!user) {
        logger.info("User.findOne", { message: "User Not found.", status: false });
        return res.status(404).send({ message: "User Not found.", status: false });
      }

      var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);


      if (!passwordIsValid) {
        return res.status(401).send({ accesstoken: null, message: "Invalid Password!", status: false });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });


      if (user.accountstatus == false) {
        logger.info("Signin", { status: false, message: "Your account is not activated; please contact the administrator." });
        res.status(200).send({ status: false, message: "Your account is not activated; please contact the administrator." });
      } else {
        logger.info("Signin", { _id: user._id, usercode: user.usercode, profile: user.profile, username: user.username, email: user.email, mobile: user.mobile, accesstoken: token, status: true });


        res.status(200).send({
          _id: user._id,
          usercode: user.usercode,
          profile: user.profile,
          username: user.username,
          email: user.email,
          mobile: user.mobile,
          accesstoken: token,
          status: true
        });
      }


    }).catch(err => {
      // Handle error
      logger.info("User.findOne", { err });
      res.status(500).send({ message: err, status: false });
      return;
    });
    
};

exports.AdminSignup = (req, res) => {


  

  const admin = new Admin({
    usercode : req.body.usercode,
    password : bcrypt.hashSync(req.body.password, 8),
    accountstatus : true,
    mobile : req.body.mobile,
    email : req.body.email,
    createdon : moment().format('LLL').toString(),
    username : req.body.username,
    profile : req.body.profile,

  });

  admin.save();

  logger.info("Signup", { message: "admin was registered successfully!", status: true });
        res.send({ message: "admin was registered successfully!", status: true });


  // Admin.findOne({ email: admin.email }, (err, userEmail) => {
  //   if (err) {
  //     logger.info("admin.findOne", { err });
  //     res.status(500).send({ message: err, status: true });
  //     return;
  //   }

  //   if (userEmail != null && userEmail.email == admin.email) {
  //     res.status(500).send({ message: "The user's email ID already exists.", status: true });
  //     return;
  //   }

  //   Admin.findOne({ mobile: admin.mobile }, (err, userMobile) => {
  //     if (err) {
  //       logger.info("admin.findOne", { err });
  //       res.status(500).send({ message: err, status: true });
  //       return;
  //     }

  //     if (userMobile != null && userMobile.mobile == admin.mobile) {
  //       res.status(500).send({ message: "The user's mobile number already exists.", status: true });
  //       return;
  //     }

  //     admin.save((err, admin) => {
  //       if (err) {
  //         logger.info("admin.save", { err });
  //         res.status(500).send({ message: err, status: true });
  //         return;
  //       }

  //       logger.info("Signup", { message: "admin was registered successfully!", status: true });
  //       res.send({ message: "admin was registered successfully!", status: true });

  //     });
  //   });
  // });


};

exports.getAdmins = async (req, res) =>{
  const list = await Admin.find({});
  logger.info("getAdminList.find", { Adminlist: list, status: true });
  res.status(200).send({ Adminlist: list, status: true });


};

//-------------------------------------------------------------------
//Customer Login
exports.CustomerLogin = (req, res) => {

  Customer.findOne({ usercode: req.body.usercode })
    .exec((err, user) => {
      if (err) {
        logger.info("User.findOne", { err });
        res.status(500).send({ message: err, status: false });
        return;
      }

      if (!user) {
        logger.info("User.findOne", { message: "User Not found.", status: false });
        return res.status(404).send({ message: "User Not found.", status: false });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accesstoken: null,
          message: "Invalid Password!",
          status: false
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      if (user.accountstatus == false) {
        logger.info("Signin", { status: false, message: "Your account is not activated; please contact the administrator." });
        res.status(200).send({ status: false, message: "Your account is not activated; please contact the administrator." });
      } else {

        logger.info("Signin", {
          _id: user._id,
          usercode: user.usercode,
          profile: user.profile,
          username: user.username,
          email: user.email,
          mobile: user.mobile,
          accesstoken: token,
          status: true
        });


        res.status(200).send({
          _id: user._id,
          usercode: user.usercode,
          profile: user.profile,
          username: user.username,
          email: user.email,
          mobile: user.mobile,
          accesstoken: token,
          status: true
        });
      }
    });

};

exports.CustomerSignup = (req, res) => {

  const customer = new Customer({
    name: req.body.name,
    mobile: req.body.mobile,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    photo: req.file.path,
    accountstatus: true,
    roles: req.body.roles,
    BUILD_ID: req.body.BUILD_ID,
    date: moment().format('LLL').toString(),

  });


  Customer.findOne({ email: customer.email }, (err, userEmail) => {
    if (err) {
      logger.info("customer.findOne", { err });
      res.status(500).send({ message: err, status: true });
      return;
    }

    if (userEmail != null && userEmail.email == customer.email) {
      res.status(500).send({ message: "The user's email ID already exists.", status: true });
      return;
    }

    Customer.findOne({ mobile: customer.mobile }, (err, userMobile) => {
      if (err) {
        logger.info("customer.findOne", { err });
        res.status(500).send({ message: err, status: true });
        return;
      }

      if (userMobile != null && userMobile.mobile == customer.mobile) {
        res.status(500).send({ message: "The user's mobile number already exists.", status: true });
        return;
      }

      Customer.save((err, Customer) => {
        if (err) {
          logger.info("Customer.save", { err });
          res.status(500).send({ message: err, status: true });
          return;
        }

        logger.info("Signup", { message: "Customer was registered successfully!", status: true });
        res.send({ message: "Customer was registered successfully!", status: true });

      });
    });
  });



};

exports.getCustomers = async (req, res) => {

  const list = await Customer.find({});
  logger.info("getCustomerList.find", { Customerlist: list, status: true });
  res.status(200).send({ Customerlist: list, status: true });

};

//-------------------------------------------------------------------
//builder Login
exports.BuilderLogin = (req, res) => {
  
  console.log(req.body);

  Builder.findOne({ usercode: req.body.username })
    .exec() 
    .then(user => {

      if (!user) {
        logger.info("User.findOne", { message: "User Not found.", status: false });
        return res.status(404).send({ message: "User Not found.", status: false });
      }

      var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);


      if (!passwordIsValid) {
        return res.status(401).send({ accesstoken: null, message: "Invalid Password!", status: false });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });


      if (user.accountstatus == false) {
        logger.info("Signin", { status: false, message: "Your account is not activated; please contact the administrator." });
        res.status(200).send({ status: false, message: "Your account is not activated; please contact the administrator." });
      } else {
        logger.info("Signin", { _id: user._id, usercode: user.usercode, profile: user.profile, username: user.username, email: user.email, mobile: user.mobile, accesstoken: token, status: true });


        res.status(200).send({
          _id: user._id,
          usercode: user.usercode,
          profile: user.profile,
          username: user.username,
          email: user.email,
          mobile: user.mobile,
          accesstoken: token,
          status: true
        });
      }


    }).catch(err => {
      // Handle error
      logger.info("User.findOne", { err });
      res.status(500).send({ message: err, status: false });
      return;
    });
    

};


exports.BuilderSignup = (req, res) => {

  const builder = new Builder({
    name: req.body.name,
    mobile: req.body.mobile,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    photo: req.file.path,
    accountstatus: true,
    roles: req.body.roles,
    BUILD_ID: req.body.BUILD_ID,
    date: moment().format('LLL').toString(),

  });


  Builder.findOne({ email: builder.email }, (err, userEmail) => {
    if (err) {
      logger.info("builder.findOne", { err });
      res.status(500).send({ message: err, status: true });
      return;
    }

    if (userEmail != null && userEmail.email == builder.email) {
      res.status(500).send({ message: "The user's email ID already exists.", status: true });
      return;
    }

    Builder.findOne({ mobile: builder.mobile }, (err, userMobile) => {
      if (err) {
        logger.info("builder.findOne", { err });
        res.status(500).send({ message: err, status: true });
        return;
      }

      if (userMobile != null && userMobile.mobile == builder.mobile) {
        res.status(500).send({ message: "The user's mobile number already exists.", status: true });
        return;
      }

      Builder.save((err, Builder) => {
        if (err) {
          logger.info("Builder.save", { err });
          res.status(500).send({ message: err, status: true });
          return;
        }

        logger.info("Signup", { message: "Builder was registered successfully!", status: true });
        res.send({ message: "Builder was registered successfully!", status: true });

      });
    });
  });

};

exports.getBuilders = async (req, res) => {
  const build = await Builder.find({});
  logger.info("getBuilderList.find", { builderlist: build, status: true });
  res.status(200).send({ builderlist: build, status: true });

};



//--------------------------------------------------------------------------------
//Supplier
exports.SupplierLogin = (req, res) => {
  
  console.log(req.body);

  Supplier.findOne({ usercode: req.body.username })
    .exec() 
    .then(user => {

      if (!user) {
        logger.info("User.findOne", { message: "User Not found.", status: false });
        return res.status(404).send({ message: "User Not found.", status: false });
      }

      var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);


      if (!passwordIsValid) {
        return res.status(401).send({ accesstoken: null, message: "Invalid Password!", status: false });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });


      if (user.accountstatus == false) {
        logger.info("Signin", { status: false, message: "Your account is not activated; please contact the administrator." });
        res.status(200).send({ status: false, message: "Your account is not activated; please contact the administrator." });
      } else {
        logger.info("Signin", { _id: user._id, usercode: user.usercode, profile: user.profile, username: user.username, email: user.email, mobile: user.mobile, accesstoken: token, status: true });


        res.status(200).send({
          _id: user._id,
          usercode: user.usercode,
          profile: user.profile,
          username: user.username,
          email: user.email,
          mobile: user.mobile,
          accesstoken: token,
          status: true
        });
      }


    }).catch(err => {
      // Handle error
      logger.info("User.findOne", { err });
      res.status(500).send({ message: err, status: false });
      return;
    });
    

};

exports.SupplierSignup = (req, res) => {

  const supplier = new Supplier({
    name: req.body.name,
    mobile: req.body.mobile,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    photo: req.file.path,
    accountstatus: true,
    roles: req.body.roles,
    BUILD_ID: req.body.BUILD_ID,
    date: moment().format('LLL').toString(),

  });


  Supplier.findOne({ email: supplier.email }, (err, userEmail) => {
    if (err) {
      logger.info("supplier.findOne", { err });
      res.status(500).send({ message: err, status: true });
      return;
    }

    if (userEmail != null && userEmail.email == supplier.email) {
      res.status(500).send({ message: "The user's email ID already exists.", status: true });
      return;
    }

    Supplier.findOne({ mobile: supplier.mobile }, (err, userMobile) => {
      if (err) {
        logger.info("supplier.findOne", { err });
        res.status(500).send({ message: err, status: true });
        return;
      }

      if (userMobile != null && userMobile.mobile == supplier.mobile) {
        res.status(500).send({ message: "The user's mobile number already exists.", status: true });
        return;
      }

      Supplier.save((err, Supplier) => {
        if (err) {
          logger.info("Supplier.save", { err });
          res.status(500).send({ message: err, status: true });
          return;
        }

        logger.info("Signup", { message: "Supplier was registered successfully!", status: true });
        res.send({ message: "Supplier was registered successfully!", status: true });

      });
    });
  });


};

exports.getSuppliers = async (req, res) => {

  const list = await Supplier.find({});
  logger.info("getSupplierList.find", { Supplierlist: list, status: true });
  res.status(200).send({ Supplierlist: list, status: true });

};


//-----------------------------------------------------------------------------------
exports.VendorLogin = (req, res) => {
 
  console.log(req.body);

  Vendor.findOne({ usercode: req.body.username })
    .exec() 
    .then(user => {

      if (!user) {
        logger.info("User.findOne", { message: "User Not found.", status: false });
        return res.status(404).send({ message: "User Not found.", status: false });
      }

      var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);


      if (!passwordIsValid) {
        return res.status(401).send({ accesstoken: null, message: "Invalid Password!", status: false });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });


      if (user.accountstatus == false) {
        logger.info("Signin", { status: false, message: "Your account is not activated; please contact the administrator." });
        res.status(200).send({ status: false, message: "Your account is not activated; please contact the administrator." });
      } else {
        logger.info("Signin", { _id: user._id, usercode: user.usercode, profile: user.profile, username: user.username, email: user.email, mobile: user.mobile, accesstoken: token, status: true });


        res.status(200).send({
          _id: user._id,
          usercode: user.usercode,
          profile: user.profile,
          username: user.username,
          email: user.email,
          mobile: user.mobile,
          accesstoken: token,
          status: true
        });
      }


    }).catch(err => {
      // Handle error
      logger.info("User.findOne", { err });
      res.status(500).send({ message: err, status: false });
      return;
    });
 

};

exports.VendorSignup = (req, res) => {

};

exports.GetVendor = async (req, res) => {

  const list = await Vendor.find({});
  logger.info("getVendorlist.find", { Vendorlist: list, status: true });
  res.status(200).send({ Vendorlist: list, status: true });

};

//--------------------------------------------------------------------------------------
exports.subcontractorLogin = (req, res) => {
  console.log(req.body);

  SubContractor.findOne({ usercode: req.body.username })
    .exec() 
    .then(user => {

      if (!user) {
        logger.info("User.findOne", { message: "User Not found.", status: false });
        return res.status(404).send({ message: "User Not found.", status: false });
      }

      var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);


      if (!passwordIsValid) {
        return res.status(401).send({ accesstoken: null, message: "Invalid Password!", status: false });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });


      if (user.accountstatus == false) {
        logger.info("Signin", { status: false, message: "Your account is not activated; please contact the administrator." });
        res.status(200).send({ status: false, message: "Your account is not activated; please contact the administrator." });
      } else {
        logger.info("Signin", { _id: user._id, usercode: user.usercode, profile: user.profile, username: user.username, email: user.email, mobile: user.mobile, accesstoken: token, status: true });


        res.status(200).send({
          _id: user._id,
          usercode: user.usercode,
          profile: user.profile,
          username: user.username,
          email: user.email,
          mobile: user.mobile,
          accesstoken: token,
          status: true
        });
      }


    }).catch(err => {
      // Handle error
      logger.info("User.findOne", { err });
      res.status(500).send({ message: err, status: false });
      return;
    });
 

}

exports.subcontractorSignup = (req, res) => {

}

exports.GetSubContractor = async (req, res) => {

  const list = await SubContractor.find({});
  logger.info("getSubContractorlist.find", { SubContractorlist: list, status: true });
  res.status(200).send({ SubContractorlist: list, status: true });

};

//-----------------------------------------------------------------------------------------
exports.ProjectAdd = (req, res) => {

};

exports.ProjectEdit = (req, res) => {

};

exports.ProjectRemove = (req, res) => {

};

exports.GetAllProject = async (req, res) => {

  const list = await Project.find({});
  logger.info("getProjectlist.find", { Projectlist: list, status: true });
  res.status(200).send({ Projectlist: list, status: true });

};

exports.getDashboardData = async (req, res) => {
  
  // const startOfMonth = moment().startOf('month').format('YYYY-MM-DD hh:mm');
  // const endOfMonth = moment().endOf('month').format('YYYY-MM-DD hh:mm');

  // let data = {
  //   totalbuilders: await Builder.countDocuments({ accountstatus: true }),
  //   totalcustomers: await Customer.countDocuments({ accountstatus: true }),
  //   totalsuppliers: await Supplier.countDocuments({ accountstatus: true }),
  //   totalcontractors: await Vendor.countDocuments({ accountstatus: true }),
  //   totalsubcontractors: await SubContractor.countDocuments({ accountstatus: true }),
  //   totalproject: await Project.countDocuments({ accountstatus: true }),
  // };

      // logger.info("getDashboardData.find", { dashboardData: data, status: true });
      // res.status(200).send({ dashboardData: data, status: true });

  
};





//--------------------------------------------------------------------------------------------------------------------------------------------
// exports.addnewplayer = (req, res) => {

//   var refferalCode = generateCode(8);

//   const player = new Players({
//     rollnumber: refferalCode,
//     username: req.body.username,
//     email: req.body.email,
//     dateofbirth: req.body.dateofbirth,
//     fathername: req.body.fathername,
//     Schoolname: req.body.Schoolname,
//     bloodgroup: req.body.bloodgroup,
//     trainingcenter: req.body.trainingcenter,
//     password: bcrypt.hashSync(req.body.password, 8),
//     address: req.body.address,
//     accesstoken: "",
//     profile: req.body.profile,
//     mobile: req.body.mobile,
//     fcmToken: "",
//     accountstatus: true,
//     kycdetails: req.body.kycdetails,
//     registrationon: moment().format('LLL').toString(),
//     lastloginon: moment().format('LLL').toString(),
//     termsandcondition: req.body.termsandcondition ? req.body.termsandcondition : true
//   });


//   Players.findOne({ email: player.email }, (err, userEmail) => {
//     if (err) {
//       logger.info("player.findOne", { err });
//       res.status(500).send({ message: err, status: true });
//       return;
//     }

//     if (userEmail != null && userEmail.email == player.email) {
//       res.status(500).send({ message: "The user's email ID already exists.", status: true });
//       return;
//     }

//     Players.findOne({ mobile: player.mobile }, (err, userMobile) => {
//       if (err) {
//         logger.info("player.findOne", { err });
//         res.status(500).send({ message: err, status: true });
//         return;
//       }

//       if (userMobile != null && userMobile.mobile == player.mobile) {
//         res.status(500).send({ message: "The user's mobile number already exists.", status: true });
//         return;
//       }

//       player.save((err, player) => {
//         if (err) {
//           logger.info("player.save", { err });
//           res.status(500).send({ message: err, status: true });
//           return;
//         }

//         logger.info("Signup", { message: "Player was registered successfully!", status: true });
//         res.send({ message: "Player was registered successfully!", status: true });

//       });
//     });
//   });

// }

// exports.getPlayerList = async (req, res) => {

//   // const page = req.body.pagenumber || 0;
//   // const usersperpage = 100;
//   // const users = await Players.find().skip(page * usersperpage).limit(usersperpage);
//   const players = await Players.find();
//   logger.info("getPlayerList.find", { playerlist: players, status: true });
//   res.status(200).send({ playerlist: players, status: true });

// }

// exports.getplayerlistwithpagenumber = async (req, res) => {

//   const page = req.body.pagenumber || 0;
//   const usersperpage = 100;
//   const players = await Players.find().skip(page * usersperpage).limit(usersperpage);
//   // const players = await Players.find();
//   logger.info("getplayerlistwithpagenumber.find", { playerlist: players, status: true });
//   res.status(200).send({ playerlist: players, status: true });

// }

// exports.getPlayerDetailsbyMobile = async (req, res) => {

//   const player = await Players.find({ "mobile": req.body.mobile });
//   logger.info("getPlayerDetailsbyMobile.find", { playerlist: player, status: true });
//   res.status(200).send({ playerlist: player, status: true });

// }

// exports.updatePlayerDetailsbyAdmin = async (req, res) => {

//   var update = { "$set": {} };
//   if (req.body.accountstatus) {
//     update = { "$set": { "accountstatus": req.body.accountstatusval } };
//   } else if (req.body.alldata) {
//     update = {
//       "$set": {
//         "username": req.body.username,
//         "email": req.body.email,
//         "dateofbirth": req.body.dateofbirth,
//         "fathername": req.body.fathername,
//         "bloodgroup": req.body.bloodgroup,
//         "address": req.body.address,
//         "trainingcenter": req.body.trainingcenter,
//         "Schoolname": req.body.Schoolname,
//       }
//     };
//   }

//   Players.updateOne({ "mobile": req.body.mobile }, update, (err, updateUserDetails) => {
//     if (err) {
//       logger.info("updatePlayerDetailsbyAdmin.updateOne", { message: err, status: false });
//       return;
//     }
//     logger.info("updatePlayerDetailsbyAdmin.updateOne", { message: "Player details updated successfully.", status: true });
//     res.status(200).send({ message: "Player details updated successfully.", status: true });
//   });
// }

// exports.updatePlayerKYC = async (req, res) => {

//   Players.updateOne({ "mobile": req.body.mobile }, { "$set": { "kycdetails": "PlayerKYC/" + req.file.filename } }, (err, updatePlayerDetails) => {
//     if (err) {
//       logger.info("updatePlayerKYC.updateOne", { message: err, status: false });
//       return;
//     }
//     logger.info("updatePlayerKYC.updateOne", { message: "Player kyc updated successfully.", status: true });
//     res.status(200).send({ message: "Player kyc updated successfully.", status: true });
//   });

// }

// exports.updatePlayerProfile = async (req, res) => {

//   Players.updateOne(
//     { "rollnumber": req.body.rollnumber },
//     {
//       "$set":
//       {
//         "username": req.body.username,
//         "trainingcenter": req.body.trainingcenter,
//         "profile": req.body.profile,
//         "mobile": req.body.mobile,
//         "kycdetails": req.body.kycdetails,
//         "fathername": req.body.fathername,
//         "email": req.body.email,
//         "dateofbirth": req.body.dateofbirth,
//         "bloodgroup": req.body.bloodgroup,
//         "address": req.body.address,
//         "Schoolname": req.body.Schoolname,
//       },
//     }, (err, updatePlayerDetails) => {
//       if (err) {
//         logger.info("updatePlayerProfile.updateOne", { message: err, status: false });
//         return;
//       }
//       logger.info("updatePlayerProfile.updateOne", { message: "Player details updated successfully.", status: true });
//       res.status(200).send({ message: "Player details updated successfully.", status: true });
//     });

// }

// exports.playerPasswordUpdate = async (req, res) => {

//   Players.findOne({ mobile: req.body.mobile }, (err, playerDetails) => {
//     if (err) {
//       logger.info("userpasswordupdate->User.findOne", { err });
//       res.status(200).send({ status: false, message: "Internal Server Error, please try again later." });
//       return;
//     }

//     if (playerDetails == null) {
//       logger.info("userpasswordupdate-> User not found");
//       res.status(200).send({ status: false, message: "User not found." });
//       return;
//     }

//     playerDetails.password = bcrypt.hashSync(req.body.userNewPassword, 8);
//     playerDetails.save();
//     logger.info("userpasswordupdate", { message: "User's password updated successfully." });
//     // if (playerDetails.fcmToken != "") {
//     //   sendNotification.sendSinglePushnotification(playerDetails.fcmToken, "Your password has been reseted successfully at " + moment().format('LLL').toString());
//     // }

//     // sendEmailNotification.sendEmailNotification(playerDetails.username, playerDetails.email , null, 0);
//     res.status(200).send({ message: "Player's password updated successfully." });

//   });
// };


// exports.getPlayerfeesbyid = async (req, res) => {

//   const playerfeeList = await Playerfees.find({ "playerid": req.body.playerid });
//   logger.info("getPlayerfeesbyid.find", { playerfeeList: playerfeeList, status: true });
//   res.status(200).send({ playerfeeList: playerfeeList, status: true });

// };

// exports.playerFeeEntry = async (req, res) => {

//   const playerFeeEntry = new Playerfees({
//     playerid: req.body.playerid,
//     playername: req.body.playername,
//     playermobile: req.body.playermobile,
//     dateofpayment: req.body.dateofpayment,
//     paymenttype: req.body.paymenttype,
//     paymentmode: req.body.paymentmode,
//     amount: req.body.amount,
//     enteredby: req.body.enteredby,
//     adminid: req.body.adminid,
//     transid: req.body.transid,
//     trainingcenter: req.body.trainingcenter,
//     Schoolname: req.body.Schoolname,
//     remarks: req.body.remarks,
//   });

//   playerFeeEntry.save((err, feeEntry) => {
//     if (err) {
//       logger.info("playerFeeEntry.save", { err });
//       res.status(500).send({ message: err, status: true });
//       return;
//     }

//     logger.info("Signup", { message: "Player fees enter successfully!", status: true });
//     res.send({ message: "Player fees enter successfully!", status: true });
//   });
// };

// exports.getAllPlayerFeesHistory = async (req, res) => {

//   const playerfeeList = await Playerfees.find();
//   logger.info("getPlayerfeesbyid.find", { playerfeeList: playerfeeList, status: true });
//   res.status(200).send({ playerfeeList: playerfeeList, status: true });

// };

// exports.getAllPlayerFees = async (req, res) => {

//   const playerfeeList = await Playerfees.find();
//   logger.info("getAllPlayerFees.find", { playerfeeList: playerfeeList, status: true });
//   res.status(200).send({ playerfeeList: playerfeeList, status: true });

// };

// exports.getPlayerFeeswithDate = async (req, res) => {

//   const startDate = moment(req.body.startDate, "YYYY-MM-DD").format();
//   const endDate = moment(req.body.endDate, "YYYY-MM-DD").format();

//   Playerfees.find({ dateofpayment: { $gte: startDate, $lt: endDate }, trainingcenter: req.body.traninginCenter }, async (err, playerfeeList) => {
//     if (err) {
//       logger.info("getPlayerFeeswithDate", { err });
//       res.status(500).send({ message: err, status: false });
//       return;
//     }

//     logger.info("getPlayerFeeswithDate.find", { playerfeeList: playerfeeList, status: true });
//     res.status(200).send({ playerfeeList: playerfeeList, status: true });

//   });

// };

// exports.deletePlayerFee = async (req, res) => {

//   Playerfees.deleteOne({ "_id": req.body.reportid }, (err, playerfeedetails) => {
//     if (err) {
//       logger.info("deletePlayerFee", { err });
//       res.status(500).send({ message: err, status: false });
//       return;
//     }
//     logger.info("deletePlayerFee.find", { message: "Player fee record deleted successfully", status: true });
//     res.status(200).send({ message: "Player fee record deleted successfully", status: true });
//   });
// };

// exports.getDashboardData = async (req, res) => {
//   const startOfMonth = moment().startOf('month').format('YYYY-MM-DD hh:mm');
//   const endOfMonth = moment().endOf('month').format('YYYY-MM-DD hh:mm');

//   let data = {
//     totalplayers: await Players.countDocuments(),
//     totaldeactivatedplayers: await Players.countDocuments({ accountstatus: false }),
//     totalfeesentry: await Playerfees.countDocuments(),
//     totalastmonthfeesentry: await Playerfees.countDocuments({ dateofpayment: { $gte: startOfMonth, $lt: endOfMonth } }),
//     totalcurrentmonthpendingpayment: 0
//   };

//   Players.aggregate(
//     [
//       {
//         $lookup: {
//           from: "playerfees",
//           let: { mobile: "$mobile" },
//           pipeline: [
//             { $match: { $expr: { $eq: ["$playermobile", "$$mobile"] }, "dateofpayment": { $gte: new Date(startOfMonth), $lt: new Date(endOfMonth) }, "paymenttype": "Monthly Fee" }, },
//             { $project: { _id: 1, playername: 1, playermobile: 1, trainingcenter: 1 } }
//           ],
//           as: "playerlist"
//         },
//       },
//       { $unset: ["fathername", "bloodgroup", "password", "address", "accesstoken", "profile", "fcmToken", "accountstatus", "kycdetails", "registrationon", "lastloginon", "termsandcondition", "Schoolname", "dateofbirth", "email", "rollnumber", "__v"] }

//     ], async (err, pendingfeelist) => {
//       if (err) {
//         logger.info("getPlayerPendingPaymentList", { message: err, status: false });
//         res.status(500).send({ message: err, status: false });
//         return;
//       }
//       let pendingCount = 0;
//       pendingfeelist.forEach(element => {
//         if (element.playerlist.length == 0) {
//           pendingCount++;
//         }
//       });

//       data.totalcurrentmonthpendingpayment = pendingCount;
//       logger.info("getDashboardData.find", { dashboardData: data, status: true });
//       res.status(200).send({ dashboardData: data, status: true });

//     });
// };

// exports.getPlayerPendingPaymentList = (req, res) => {

//   const startOfMonth = moment().startOf('month').format("YYYY-MM-DD hh:mm");
//   const endOfMonth = moment().endOf('month').format("YYYY-MM-DD hh:mm");

//   console.log(startOfMonth);
//   console.log(endOfMonth);

//   Players.aggregate(
//     [
//       {
//         $lookup: {
//           from: "playerfees",
//           let: { mobile: "$mobile" },
//           pipeline: [
//             { $match: { $expr: { $eq: ["$playermobile", "$$mobile"] }, "dateofpayment": { $gte: new Date(startOfMonth), $lt: new Date(endOfMonth) }, "paymenttype": "Monthly Fee" }, },
//             { $project: { _id: 1, playername: 1, playermobile: 1, trainingcenter: 1 } }
//           ],
//           as: "playerlist"
//         },
//       },
//       { $unset: ["fathername", "bloodgroup", "password", "address", "accesstoken", "profile", "fcmToken", "accountstatus", "kycdetails", "registrationon", "lastloginon", "termsandcondition", "Schoolname", "dateofbirth", "email", "rollnumber", "__v"] }

//     ], async (err, pendingfeelist) => {
//       if (err) {
//         logger.info("getPlayerPendingPaymentList", { message: err, status: false });
//         res.status(500).send({ message: err, status: false });
//         return;
//       }
//       logger.info("getPlayerPendingPaymentList", { pendingPlayerfeelist: pendingfeelist, status: true });
//       res.status(200).send({ pendingPlayerfeelist: pendingfeelist, status: true });
//     });

// }

// exports.playerReportEntry = async (req, res) => {

//   const playerReportEntry = new Playerreport({
//     playername: req.body.playername,
//     dateofbirth: req.body.dateofbirth,
//     age: req.body.age,
//     mobile: req.body.mobile,
//     preferredfoot: req.body.preferredfoot,
//     height: req.body.height,
//     weight: req.body.weight,
//     position: req.body.position,
//     monthofassessment: req.body.monthofassessment,
//     overallattendance: req.body.overallattendance,
//     behaviour: req.body.behaviour,
//     agility: req.body.agility,
//     pace: req.body.pace,
//     endurance: req.body.endurance,
//     upperbody: req.body.upperbody,
//     core: req.body.core,
//     lowerbody: req.body.lowerbody,
//     flexibility: req.body.flexibility,
//     firsttouch: req.body.firsttouch,
//     footjuggle: req.body.footjuggle,
//     thighjuggle: req.body.thighjuggle,
//     headjuggles: req.body.headjuggles,
//     dribbling: req.body.dribbling,
//     shooting: req.body.shooting,
//     tackling: req.body.tackling,
//     communication: req.body.communication,
//     teamwork: req.body.teamwork,
//     decisions: req.body.decisions,
//     leadership: req.body.leadership,
//     composure: req.body.composure,
//     vision: req.body.vision,
//     workrate: req.body.workrate,
//     encouraging: req.body.encouraging,
//     copingskill: req.body.copingskill,
//     supportive: req.body.supportive,
//     listening: req.body.listening,
//     overallimpact: req.body.overallimpact,
//     trainingfeedback: req.body.trainingfeedback,
//     gamingfeedback: req.body.gamingfeedback,
//     coachname: req.body.coachname,
//     enteredby: req.body.enteredby,
//     trainingcenter: req.body.trainingcenter,
//   });

//   playerReportEntry.save((err, feeEntry) => {
//     if (err) {
//       logger.info("playerReportEntry.save", { err });
//       res.status(500).send({ message: err, status: true });
//       return;
//     }

//     logger.info("playerReportEntry", { message: "Player's report updated successfully!", status: true });
//     res.send({ message: "Player's report updated successfully!", status: true });
//   });
// };

// exports.getAllPlayerReports = async (req, res) => {

//   const playerreportList = await Playerreport.find();
//   logger.info("getAllPlayerReports.find", { playerreportList: playerreportList, status: true });
//   res.status(200).send({ playerreportList: playerreportList, status: true });

// };

// exports.deletePlayerReports = async (req, res) => {

//   Playerreport.deleteOne({ "_id": req.body.reportid }, (err, playerreportdetails) => {
//     if (err) {
//       logger.info("deletePlayerReports", { err });
//       res.status(500).send({ message: err, status: false });
//       return;
//     }
//     logger.info("deletePlayerReports.find", { message: "Player monthly report deleted successfully", status: true });
//     res.status(200).send({ message: "Player monthly report deleted successfully", status: true });
//   });
// };

// exports.getAllAccountReports = async (req, res) => {

//   const accountreportList = await Account.find();
//   logger.info("getAllAccountReports.find", { accountreportList: accountreportList, status: true });
//   res.status(200).send({ accountreportList: accountreportList, status: true });

// };


// exports.accountReportEntry = async (req, res) => {

//   const accountReportEntry = new Account({
//     date: req.body.dateOfEntry,
//     typeofpayment: req.body.typeofpayment,
//     modeofpayment: req.body.modeOfPayment,
//     whomtopay: req.body.whomtoPay,
//     amount: req.body.amount,
//     remarks: req.body.remarks,
//     createdon: moment().format('LLL').toString(),
//     enteredby: req.body.enteredby,
//     adminid: req.body.adminid
//   });

//   accountReportEntry.save((err, accountEntry) => {
//     if (err) {
//       logger.info("accountReportEntry.save", { err });
//       res.status(500).send({ message: err, status: true });
//       return;
//     }

//     logger.info("accountReportEntry", { message: "Account entry updated successfully!", status: true });
//     res.send({ message: "Account entry updated successfully!", status: true });
//   });
// };

// exports.getAccountsswithDate = async (req, res) => {

//   const startDate = moment(req.body.startDate, "YYYY-MM-DD").format();
//   const endDate = moment(req.body.endDate, "YYYY-MM-DD").format();

//   Account.find({ date: { $gte: startDate, $lt: endDate } }, async (err, accountentryLists) => {
//     if (err) {
//       logger.info("getAccountsswithDate", { err });
//       res.status(500).send({ message: err, status: false });
//       return;
//     }

//     logger.info("getAccountsswithDate.find", { accountentryList: accountentryLists, status: true });
//     res.status(200).send({ accountentryList: accountentryLists, status: true });

//   });

// };

// exports.updateRemark = async (req, res) => {

//   const accountupdateRemark = await Account.updateOne({ _id: req.body._id }, { remarks: req.body.remarks });

//   logger.info("accountupdateRemark.update", { accountupdateRemark: accountupdateRemark, status: true });
//   res.status(200).send({ accountupdateRemark: accountupdateRemark, status: true });

// }; 