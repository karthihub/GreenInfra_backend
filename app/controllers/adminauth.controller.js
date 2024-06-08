
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

const ProjectMaterials = db.ProjectMaterials;
const Materials = db.Materials;
const Task = db.Task;

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
//builder Login
exports.BuilderLogin = (req, res) => {
  
  console.log(req.body);

  Builder.findOne({ usercode: req.body.usercode })
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
        res.status(200).send({ status: false, message: "Your account is not activated; please contact the administrator." }).header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
        );
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
          companyemail:  user.companyemail,
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

        header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
          );
        res.status(200).send({
          _id: user._id, 
          usercode: user.usercode,  
          username: user.username, 
          mobile: user.mobile,
          email: user.email,  
          profile: user.profile,
          companyname: user.companyname, 
          companymobile: user.companymobile,
          companyemail: user.companyemail,
          officeaddress: user.officeaddress, 
          location: user.location, 
          roles: user.roles, 
          date: user.date,
          accountstatus: true,
          Admin_ID: user.Admin_ID,  
          createdOn: user.createdOn,
          accesstoken: token, 
          status: true 
        }).header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
        );
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
    profile:  req.body.profile,
    companyname:   req.body.companyname,
    companymobile:   req.body.companymobile,
    companyemail:   req.body.companyemail,
    officeaddress:   req.body.officeaddress,
    location:   req.body.location,
    roles:   "Builder",
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


//--------------------------------------------------------------------------------------
//contractor
exports.ContractorLogin = (req, res) => {
  console.log(req.body);

  Contractor.findOne({ usercode: req.body.usercode })
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
    profile:  req.body.profile, 
    address: req.body.address,
    location: req.body.location,
    accountstatus: true ,
    roles: "Contractor",  
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

  const list = await Contractor.find({ accountstatus : true });
  logger.info("getContractorlist.find", { contractorlist: list, status: true });
  res.status(200).send({ contractorlist: list, status: true });

};

exports.GetContractorDisable = async (req, res) => {
  const build = await Contractor.find({ accountstatus: false });
  logger.info("getContractorlist.find", { contractorlist: build, status: true });
  res.status(200).send({ contractorlist: build, status: true });

};


//-------------------------------------------------------------------
//Customer Login
exports.CustomerLogin = (req, res) => {

  Customer.findOne({ usercode: req.body.usercode })
    .exec()
    .then(user => {
     

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
    location: req.body.location,
    password:  bcrypt.hashSync(req.body.password, 8),
    profile:  req.body.profile,
    accountstatus: true,
    roles:  "Customer",
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






//--------------------------------------------------------------------------------
//Supplier
exports.SupplierLogin = (req, res) => {
  
  console.log(req.body);

  Supplier.findOne({ username: req.body.usercode })
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
    roles:  "Supplier",
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
  logger.info("getSupplierList.find", { supplierlist: list, status: true });
  res.status(200).send({ supplierlist: list, status: true });

};

exports.getSuppliersDisable = async (req, res) => {
  
  const list = await Supplier.find({ accountstatus: false });
  logger.info("getSupplierList.find", { supplierlist: list, status: true });
  res.status(200).send({ supplierlist: list, status: true });

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
    blueprint: req.body.blueprint, 
    totalsquarefeet:  req.body.totalsquarefeet,
    squarefeetprice:  req.body.squarefeetprice,
    othercost:  req.body.othercost,
    otherdescription:  req.body.otherdescription,
    totalprojectvalue:  req.body.totalprojectvalue,
    suggestion:  req.body.suggestion,
    remarks:  req.body.remarks,
    CUSTOMER_ID:  req.body.custimerid,
    BUILDER_ID:  req.body.builderid,
    SUPPLIER_ID:  req.body.supplierid,
    CONTRACTOR_ID:  req.body.contractorid,
    startdate: req.body.startdate,
    enddate: req.body.enddate,
    extensiondate: req.body.extensiondate,
    projectStatus : "open",
    createdOn: moment().format('LLL').toString(),
    // material: req.body.material,
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




//materials
exports.MaterialsAdd = (req, res) => {

  console.log(req.body);
  
  const material = new Materials({
    materialname : req.body.materialname,
    type : req.body.type,
    quantity : req.body.quantity,
    price : req.body.price,
    location : req.body.location,
    accountstatus : true,
    SUPPLIER_ID : req.body.SUPPLIER_ID,
    createdOn: moment().format('LLL').toString()
  });

  material.save();

  logger.info("MaterialAdd", { message: "Material was added successfully!", status: true });
  res.send({ message: "Material was added successfully!", status: true });


};

exports.getMaterials = async (req, res) => {

  const list = await Materials.find({});
  logger.info("getMaterialslist.find", { materialslist: list, status: true });
  res.status(200).send({ materialslist: list, status: true });


};

//project materials
exports.ProjectMaterialsAdd = (req, res) => {

  console.log(req.body);
  
  const projectmaterial = new ProjectMaterials({
    materialname : req.body.materialname,
    type : req.body.type,
    quantity : req.body.quantity,
    price : req.body.price,
    location : req.body.location,
    accountstatus : true,
    SUPPLIER_ID : req.body.SUPPLIER_ID,
    PROJECT_ID : req.body.PROJECT_ID,
  });

  projectmaterial.save();

  logger.info("Project MaterialAdd", { message: "Project Material was added successfully!", status: true });
  res.send({ message: "Project Material was added successfully!", status: true });


};

exports.getProjectMaterials = async (req, res) => {

  const list = await ProjectMaterials.find({});
  logger.info("getProjectMaterials.find", { ProjectMaterialslist: list, status: true });
  res.status(200).send({ ProjectMaterialslist: list, status: true });


};

//task
exports.taskAdd = (req, res) => {


  console.log(req.body);
  
  const task = new Task({

    task : req.body.task,
    remarks :  req.body.remarks,
    progress :  req.body.progress,
    price :  req.body.price,
    updateOn : moment().format('LLL').toString(),
    createdOn : moment().format('LLL').toString(),
    accountstatus : true ,
    BUILDER_ID :  req.body.BUILDER_ID,
    SUPPLIER_ID :  req.body.SUPPLIER_ID,
    CONTRACTOR_ID : req.body.CONTRACTOR_ID

  });

  task.save();

  logger.info("Task Add", { message: "Task was added successfully!", status: true });
  res.send({ message: "Task was added successfully!", status: true });


};

exports.tasklist = async (req, res) => {

  const list = await Task.find({});
  logger.info("Tasklist.find", { Tasklist: list, status: true });
  res.status(200).send({ Tasklist: list, status: true });

};

exports.taskComplete = async (req, res) => {
  
  const list = await Task.find({});
  logger.info("Tasklist.find", { Tasklist: list, status: true });
  res.status(200).send({ Tasklist: list, status: true });

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

  let data = {
    totalproject: await Project.countDocuments({}),
    projectcompleted: await Project.countDocuments({ projectStatus: "completed" }),
    projectterminated: await Project.countDocuments({ projectStatus: "terminated" }),
    projectclosed: await Project.countDocuments({ projectStatus: "closed" }),
  }

  logger.info("getDashboardData.find", { dashboardData: data, status: true });
  res.status(200).send({ dashboardData: data, status: true });
};

