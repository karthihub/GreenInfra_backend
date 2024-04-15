
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
const Contractor = db.Contractor
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
        logger.info("AdminSignin.findOne", { message: "User Not found.", status: false });
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
        logger.info("AdminSignin", { status: false, message: "Your account is not activated; please contact the administrator." });
        res.status(200).send({ status: false, message: "Your account is not activated; please contact the administrator." });
      } else {
        logger.info("AdminSignin", { _id: user._id, usercode: user.usercode, profile: user.profile, username: user.username, email: user.email, mobile: user.mobile, accesstoken: token, roles: user.roles, status: true });


        res.status(200).send({
          _id: user._id,
          usercode: user.usercode,
          profile: user.profile,
          username: user.username,
          email: user.email,
          mobile: user.mobile,
          accesstoken: token,
          roles: user.roles,
          status: true
        });
      }


    }).catch(err => {
      // Handle error
      logger.info("AdminSignin.findOne", { err });
      res.status(500).send({ message: err, status: false });
      return;
    });
    
};

exports.AdminSignup = (req, res) => {

  console.log(req.body);

  const admin = new Admin({

    usercode: req.body.usercode,
    password: bcrypt.hashSync(req.body.password, 8),
    accountstatus:  true ,
    mobile:req.body.mobile,
    email:req.body.email,
    createdOn: moment().format('LLL').toString(),
    username: req.body.username,
    profile: req.file.profile,
    roles: "Admin"

  });

  admin.save();

  logger.info("AdminSignup", { message: "admin was registered successfully!", status: true });
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
        logger.info("CustomerSignin.findOne", { err });
        res.status(500).send({ message: err, status: false });
        return;
      }

      if (!user) {
        logger.info("CustomerSignin.findOne", { message: "User Not found.", status: false });
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
        logger.info("CustomerSignin", { status: false, message: "Your account is not activated; please contact the administrator." });
        res.status(200).send({ status: false, message: "Your account is not activated; please contact the administrator." });
      } else {

        logger.info("CustomerSignin", {
          _id: user._id,
          usercode: user.usercode,
          username: user.username, 
          dob: user.dob,
          mobile: user.mobile, 
          email: user.email, 
          address: user.address, 
          profile: user.profile,
          accountstatus: user.accountStatus,
          roles: user.roles, 
          BUILD_ID: user.BUILD_ID, 
          accesstoken: token,
          status: true
        });


        res.status(200).send({
          _id: user._id,
          usercode: user.usercode,
          username: user.username, 
          dob: user.dob,
          mobile: user.mobile, 
          email: user.email, 
          address: user.address, 
          profile: user.profile,
          accountstatus: user.accountStatus,
          roles: user.roles, 
          BUILD_ID: user.BUILD_ID, 
          accesstoken: token,
          status: true
        });
      }
    });

};

exports.CustomerSignup = (req, res) => {

  console.log(req.body);

  const customer = new Customer({

    usercode:  req.body.usercode,
    username:  req.body.username,
    dob: req.body.dob,
    mobile:  req.body.mobile,
    email:  req.body.email,
    address: req.body.address,
    password:  bcrypt.hashSync(req.body.password, 8),
    profile:  req.file.profile,
    accountstatus: true,
    roles:  req.body.roles,
    BUILD_ID: req.body.BUILD_ID, 
    createdOn: moment().format('LLL').toString()

  });

  customer.save();


  logger.info("CustomerSignup", { message: "Customer was registered successfully!", status: true });
  res.send({ message: "Customer was registered successfully!", status: true });

  // Customer.findOne({ email: customer.email }, (err, userEmail) => {
  //   if (err) {
  //     logger.info("customer.findOne", { err });
  //     res.status(500).send({ message: err, status: true });
  //     return;
  //   }

  //   if (userEmail != null && userEmail.email == customer.email) {
  //     res.status(500).send({ message: "The user's email ID already exists.", status: true });
  //     return;
  //   }

  //   Customer.findOne({ mobile: customer.mobile }, (err, userMobile) => {
  //     if (err) {
  //       logger.info("customer.findOne", { err });
  //       res.status(500).send({ message: err, status: true });
  //       return;
  //     }

  //     if (userMobile != null && userMobile.mobile == customer.mobile) {
  //       res.status(500).send({ message: "The user's mobile number already exists.", status: true });
  //       return;
  //     }

  //     Customer.save((err, Customer) => {
  //       if (err) {
  //         logger.info("Customer.save", { err });
  //         res.status(500).send({ message: err, status: true });
  //         return;
  //       }

  //       logger.info("Signup", { message: "Customer was registered successfully!", status: true });
  //       res.send({ message: "Customer was registered successfully!", status: true });

  //     });
  //    });
  // });



};

exports.getCustomers = async (req, res) => {

  const list = await Customer.find({ accountstatus: true });
  logger.info("getCustomerList.find", { customerlist: list, status: true });
  res.status(200).send({ customerlist: list, status: true });

};

exports.getCustomersDisable = async (req, res) => {

  const list = await Customer.find({ accountstatus: false });
  logger.info("getCustomerList.find", { customerlist: list, status: true });
  res.status(200).send({ customerlist: list, status: true });

};



//-------------------------------------------------------------------
//builder Login
exports.BuilderLogin = (req, res) => {
  
  console.log(req.body);

  Builder.findOne({ usercode: req.body.username })
    .exec() 
    .then(user => {

      if (!user) {
        logger.info("BuilderSignin.findOne", { message: "User Not found.", status: false });
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
        logger.info("BuilderSignin", { status: false, message: "Your account is not activated; please contact the administrator." });
        res.status(200).send({ status: false, message: "Your account is not activated; please contact the administrator." });
      } else {
        logger.info("BuilderSignin", {
          _id: user._id, 
          usercode: user.usercode,  
          username: user.username, 
          mobile: user.mobile,
          email: user.email,  
          profile: user.profile,
          companyname: user.companyname, 
          companymobile: user.companymobile,
          companyemail: companyemail,
          officeaddress: user.officeaddress, 
          location: user.location, 
          roles: user.roles, 
          date: user.date,
          accountstatus: true,
          Admin_ID: user.Admin_ID,  
          createdOn: user.createdOn,
          accesstoken: token, 
          status: true 
          });


        res.status(200).send({
          _id: user._id, 
          usercode: user.usercode,  
          username: user.username, 
          mobile: user.mobile,
          email: user.email,  
          profile: user.profile,
          companyname: user.companyname, 
          companymobile: user.companymobile,
          companyemail: companyemail,
          officeaddress: user.officeaddress, 
          location: user.location, 
          roles: user.roles, 
          date: user.date,
          accountstatus: true,
          Admin_ID: user.Admin_ID,  
          createdOn: user.createdOn,
          accesstoken: token, 
          status: true 
        });
      }


    }).catch(err => {
      // Handle error
      logger.info("BuilderSignin.findOne", { err });
      res.status(500).send({ message: err, status: false });
      return;
    });
    

};


exports.BuilderSignup = (req, res) => {

  console.log(req.body);

  const builder = new Builder({

    usercode:  req.body.usercode,
    username:  req.body.username,
    mobile:  req.body.mobile,
    email:  req.body.email,
    password:  bcrypt.hashSync(req.body.password, 8),
    profile:  req.file.profile,
    companyname:   req.body.companyname,
    companymobile:   req.body.companymobile,
    companyemail:   req.body.companyemail,
    officeaddress:   req.body.officeaddress,
    location:   req.body.location,
    roles:   req.body.roles,
    accountstatus: true ,
    Admin_ID:  req.body.Admin_ID,
    createdOn: moment().format('LLL').toString()

  });

  builder.save();

  logger.info("BuilderSignup", { message: "Builder was registered successfully!", status: true });
  res.send({ message: "Builder was registered successfully!", status: true });


  // Builder.findOne({ email: builder.email }, (err, userEmail) => {
  //   if (err) {
  //     logger.info("builder.findOne", { err });
  //     res.status(500).send({ message: err, status: true });
  //     return;
  //   }

  //   if (userEmail != null && userEmail.email == builder.email) {
  //     res.status(500).send({ message: "The user's email ID already exists.", status: true });
  //     return;
  //   }

  //   Builder.findOne({ mobile: builder.mobile }, (err, userMobile) => {
  //     if (err) {
  //       logger.info("builder.findOne", { err });
  //       res.status(500).send({ message: err, status: true });
  //       return;
  //     }

  //     if (userMobile != null && userMobile.mobile == builder.mobile) {
  //       res.status(500).send({ message: "The user's mobile number already exists.", status: true });
  //       return;
  //     }

  //     Builder.save((err, Builder) => {
  //       if (err) {
  //         logger.info("Builder.save", { err });
  //         res.status(500).send({ message: err, status: true });
  //         return;
  //       }

  //       logger.info("Signup", { message: "Builder was registered successfully!", status: true });
  //       res.send({ message: "Builder was registered successfully!", status: true });

  //     });
  //   });
  // });

};

exports.getBuilders = async (req, res) => {
  const build = await Builder.find({ accountstatus: true });
  logger.info("getBuilderList.find", { builderlist: build, status: true });
  res.status(200).send({ builderlist: build, status: true });

};

exports.getBuildersDisable = async (req, res) => {
  const build = await Builder.find({ accountstatus: false });
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
        logger.info("SupplierSignin.findOne", { message: "User Not found.", status: false });
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
        logger.info("SupplierSignin", { status: false, message: "Your account is not activated; please contact the administrator." });
        res.status(200).send({ status: false, message: "Your account is not activated; please contact the administrator." });
      } else {
        logger.info("SupplierSignin", { 

          _id: user._id, 
          usercode:  user.usercode, 
          username:  user.username,
          mobile:  user.email,
          email:  user.email, 
          profile: user.profile, 
          companyname:  user.companyname,
          companymobile:  user.companymobile,
          companyemail:  user.companyemail,
          officeaddress:  user.officeaddress,
          city:  user.city,
          state:  user.State,
          location: user.locztion, 
          roles:  user.roles,
          accountstatus: true,
          Build_ID: user.BUILD_ID, 
          accesstoken: token, 
          status: true 
        });


        res.status(200).send({
          _id: user._id, 
          usercode:  user.usercode, 
          username:  user.username,
          mobile:  user.email,
          email:  user.email, 
          profile: user.profile, 
          companyname:  user.companyname,
          companymobile:  user.companymobile,
          companyemail:  user.companyemail,
          officeaddress:  user.officeaddress,
          city:  user.city,
          state:  user.State,
          location: user.locztion, 
          roles:  user.roles,
          accountstatus: true,
          Build_ID: user.BUILD_ID, 
          accesstoken: token, 
          status: true 
        });
      }


    }).catch(err => {
      // Handle error
      logger.info("SupplierSignin.findOne", { err });
      res.status(500).send({ message: err, status: false });
      return;
    });
    

};

exports.SupplierSignup = (req, res) => {

  console.log(req.body);

  const supplier = new Supplier({
    usercode:  req.body.usercode,
    username:  req.body.username,
    mobile:  req.body.mobile,
    email:  req.body.email,
    password:  bcrypt.hashSync(req.body.password, 8),
    profile:  req.file.profile,
    companyname:  req.body.companyname,
    companymobile:  req.body.companymobile,
    companyemail:  req.body.companyemail,
    officeaddress:  req.body.officeaddress,
    city:  req.body.city,
    state:  req.body.state,
    location:  req.body.location,
    roles:  req.body.roles,
    createdOn: moment().format('LLL').toString(),
    accountstatus:  true,
    Build_ID:  req.body.BUILD_ID

  });

  supplier.save();

  logger.info("SupplierSignup", { message: "Supplier was registered successfully!", status: true });
  res.send({ message: "Supplier was registered successfully!", status: true });


  // Supplier.findOne({ email: supplier.email }, (err, userEmail) => {
  //   if (err) {
  //     logger.info("supplier.findOne", { err });
  //     res.status(500).send({ message: err, status: true });
  //     return;
  //   }

  //   if (userEmail != null && userEmail.email == supplier.email) {
  //     res.status(500).send({ message: "The user's email ID already exists.", status: true });
  //     return;
  //   }

  //   Supplier.findOne({ mobile: supplier.mobile }, (err, userMobile) => {
  //     if (err) {
  //       logger.info("supplier.findOne", { err });
  //       res.status(500).send({ message: err, status: true });
  //       return;
  //     }

  //     if (userMobile != null && userMobile.mobile == supplier.mobile) {
  //       res.status(500).send({ message: "The user's mobile number already exists.", status: true });
  //       return;
  //     }

  //     Supplier.save((err, Supplier) => {
  //       if (err) {
  //         logger.info("Supplier.save", { err });
  //         res.status(500).send({ message: err, status: true });
  //         return;
  //       }

  //       logger.info("Signup", { message: "Supplier was registered successfully!", status: true });
  //       res.send({ message: "Supplier was registered successfully!", status: true });

  //     });
  //   });
  // });


};

exports.getSuppliers = async (req, res) => {

  const list = await Supplier.find({ accountstatus: true });
  logger.info("getSupplierList.find", { Supplierlist: list, status: true });
  res.status(200).send({ Supplierlist: list, status: true });

};

exports.getSuppliersDisable = async (req, res) => {
  
  const list = await Supplier.find({ accountstatus: false });
  logger.info("getSupplierList.find", { Supplierlist: list, status: true });
  res.status(200).send({ Supplierlist: list, status: true });

}; 


//--------------------------------------------------------------------------------------
//contractor
exports.ContractorLogin = (req, res) => {
  console.log(req.body);

  Contractor.findOne({ usercode: req.body.username })
    .exec() 
    .then(user => {

      if (!user) {
        logger.info("ContractorSignin.findOne", { message: "User Not found.", status: false });
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
        logger.info("ContractorSignin", { status: false, message: "Your account is not activated; please contact the administrator." });
        res.status(200).send({ status: false, message: "Your account is not activated; please contact the administrator." });
      } else {
        logger.info("ContractorSignin", { 

          _id: user._id, 
          usercode:  user.usercode,
          username:  user.username,
          mobile: user.mobile,
          email: user.email,  
          profile: user.profile,
          accountstatus: user.accountStatus,
          roles: user.roles,
          BUILD_ID: user.BUILD_ID,
          accesstoken: token, 
          status: true 
        });


        res.status(200).send({
        
          _id: user._id, 
          usercode:  user.usercode,
          username:  user.username,
          mobile: user.mobile,
          email: user.email,  
          profile: user.profile,
          accountstatus: user.accountStatus,
          roles: user.roles,
          BUILD_ID: user.BUILD_ID,
          accesstoken: token, 
          status: true 
        });
      }


    }).catch(err => {
      // Handle error
      logger.info("ContractorSignin.findOne", { err });
      res.status(500).send({ message: err, status: false });
      return;
    });
 

}

exports.ContractorSignup = (req, res) => {

  console.log(req.body);
  
  const contractor = new Contractor({
    usercode: req.body.usercode,  
    username: req.body.username,
    mobile:  req.body.mobile,
    email:  req.body.email, 
    password: bcrypt.hashSync(req.body.password, 8),  
    profile:  req.file.profile, 
    accountstatus: true ,
    roles: req.body.roles,  
    BUILD_ID: req.body.BUILD_ID,
    createdOn: moment().format('LLL').toString()

  });

  contractor.save();

  logger.info("ContractorSignup", { message: "Contractor was registered successfully!", status: true });
  res.send({ message: "Contractor was registered successfully!", status: true });



  // Contractor.findOne({ email: contractor.email }, (err, userEmail) => {
  //   if (err) {
  //     logger.info("contractor.findOne", { err });
  //     res.status(500).send({ message: err, status: true });
  //     return;
  //   }

  //   if (userEmail != null && userEmail.email == contractor.email) {
  //     res.status(500).send({ message: "The user's email ID already exists.", status: true });
  //     return;
  //   }

  //   Contractor.findOne({ mobile: contractor.mobile }, (err, userMobile) => {
  //     if (err) {
  //       logger.info("contractor.findOne", { err });
  //       res.status(500).send({ message: err, status: true });
  //       return;
  //     }

  //     if (userMobile != null && userMobile.mobile == contractor.mobile) {
  //       res.status(500).send({ message: "The user's mobile number already exists.", status: true });
  //       return;
  //     }

  //     Contractor.save((err, Contractor) => {
  //       if (err) {
  //         logger.info("Contractor.save", { err });
  //         res.status(500).send({ message: err, status: true });
  //         return;
  //       }

  //       logger.info("Signup", { message: "Contractor was registered successfully!", status: true });
  //       res.send({ message: "Contractor was registered successfully!", status: true });

  //     });
  //   });
  // });


}

exports.GetContractor = async (req, res) => {

  const list = await Contractor.find({});
  logger.info("getContractorlist.find", { Contractorlist: list, status: true });
  res.status(200).send({ Contractorlist: list, status: true });

};

//-----------------------------------------------------------------------------------------
//project
exports.ProjectAdd = (req, res) => {

  console.log(req.body);
  
  const project = new Project({

    buildingname:  req.body.buildingname,
    location:  req.body.location,
    address:  req.body.address,
    permit:  req.body.permit,
    blueprint: req.file.blueprint, 
    totalsquarefeet:  req.body.totalsquarefeet,
    squarefeetprice:  req.body.squarefeetprice,
    othercost:  req.body.othercost,
    otherdescription:  req.body.otherdescription,
    totalprojectvalue:  req.body.totalprojectvalue,
    suggestion:  req.body.suggestion,
    remarks:  req.body.remarks,
    CUSTOMER_ID:  req.body.CUSTOMER_ID,
    BUILDER_ID:  req.body.BUILDER_ID,
    SUPPLIER_ID:  req.body.SUPPLIER_ID,
    CONTRACTOR_ID:  req.body.CONTRACTOR_ID,
    startdate: req.body.startdate,
    enddate: req.body.enddate,
    extensiondate: req.body.extensiondate,
    projectStatus : true,
    createdOn: moment().format('LLL').toString()
  });

  project.save();

  logger.info("ProjectCreate", { message: "Project was created successfully!", status: true });
  res.send({ message: "Project was created successfully!", status: true });


};

exports.ProjectUpdate = (req, res) => {

};

exports.ProjectDisable = async (req, res) => {
  
  const list = await Project.find({ accountstatus: false });
  logger.info("getProjectDisableList.find", { Supplierlist: list, status: true });
  res.status(200).send({ Supplierlist: list, status: true });

};

exports.GetAllProject = async (req, res) => {

  const list = await Project.find({});
  logger.info("getProjectlist.find", { Projectlist: list, status: true });
  res.status(200).send({ Projectlist: list, status: true });

};



//dashboard data
exports.getDashboardData = async (req, res) => {
  
  // const startOfMonth = moment().startOf('month').format('YYYY-MM-DD hh:mm');
  // const endOfMonth = moment().endOf('month').format('YYYY-MM-DD hh:mm');

  // let data = {
  //   totalbuilders: await Builder.countDocuments({ accountstatus: true }),
  //   totalcustomers: await Customer.countDocuments({ accountstatus: true }),
  //   totalsuppliers: await Supplier.countDocuments({ accountstatus: true }),
  //   totalcontractors: await Vendor.countDocuments({ accountstatus: true }),
  //   totalsubcontractors: await Contractor.countDocuments({ accountstatus: true }),
  //   totalproject: await Project.countDocuments({ accountstatus: true }),
  // };

      // logger.info("getDashboardData.find", { dashboardData: data, status: true });
      // res.status(200).send({ dashboardData: data, status: true });

  
};



