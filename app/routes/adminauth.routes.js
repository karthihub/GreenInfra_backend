const { verifySignUp } = require("../middlewares");
const controller = require("../controllers/adminauth.controller");
const { authJwt } = require("../middlewares"); const path = require("path");
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, path.resolve(__dirname, "..", "..", "Blueprint"));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`)
  },
})

const upload = multer({ storage });

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


  //admin
  app.post("/api/adminauth/AdminLogin", controller.AdminLogin);
  
  app.post("/api/adminauth/AdminSignup", controller.AdminSignup);
  
  app.get("/api/adminsuth/getAdmins", [authJwt.verifyToken], controller.getAdmins);


//------------------------------------------------------------------------
  //customer

  app.post("/api/adminauth/CustomerLogin", [authJwt.verifyToken], controller.CustomerLogin);

  app.post("/api/adminauth/CustomerSignup", [authJwt.verifyToken], controller.CustomerSignup);

  app.get("/api/adminauth/getCustomers", [authJwt.verifyToken], controller.getCustomers);

  app.get("/api/adminauth/getCustomersDisable", [authJwt.verifyToken], controller.getCustomersDisable);

//----------------------------------------------------------------------
  //builder

  app.post("/api/adminauth/BuilderLogin", [authJwt.verifyToken], controller.BuilderLogin);

  app.post("/api/adminauth/BuilderSignup", [authJwt.verifyToken], controller.BuilderSignup);

  app.get("/api/adminauth/getBuilders",[authJwt.verifyToken], controller.getBuilders);

  app.get("/api/adminauth/getBuildersDisable", [authJwt.verifyToken], controller.getBuildersDisable);

//----------------------------------------------------------------------------

  //supplier
  app.post("/api/adminauth/SupplierLogin", [authJwt.verifyToken], controller.SupplierLogin);

  app.post("/api/adminauth/SupplierSignup", [authJwt.verifyToken], controller.SupplierSignup);

  app.get("/api/adminauth/getSuppliers", [authJwt.verifyToken], controller.getSuppliers);

  app.get("/api/adminauth/getSuppliersDisable", [authJwt.verifyToken], controller.getSuppliersDisable);
//------------------------------------------------------------------------------

  //vendor
  // app.post("/api/adminsuth/VendorLogin", controller.VendorLogin);

  // app.post("/api/adminauth/VendorSignup", controller.VendorSignup);

  // app.get("/api/adminauth/GetVendor",[authJwt.verifyToken], controller.GetVendor);

//------------------------------------------------------------------------------------

//Contractor
  app.post("/api/adminauth/ContractorLogin", [authJwt.verifyToken], controller.ContractorLogin);

  app.post("/api/adminauth/ContractorSignup", [authJwt.verifyToken], controller.ContractorSignup);

  app.get("/api/adminauth/GetContractor", [authJwt.verifyToken], controller.GetContractor);

  app.get("/api/adminauth/GetContractorDisable", [authJwt.verifyToken], controller.GetContractorDisable);
 
//--------------------------------------------------------------------------------------

//projects
  app.post("/api/adminauth/ProjectAdd", [authJwt.verifyToken], controller.ProjectAdd);

  app.post("/api/adminauth/ProjectUpdate", [authJwt.verifyToken], controller.ProjectUpdate);

  app.post("/api/adminauth/ProjectDisable", [authJwt.verifyToken], controller.ProjectDisable);

  app.get("/api/adminauth/GetAllProject", [authJwt.verifyToken], controller.GetAllProject);


//--------------------------------------------------------------------------------------

//dashboard
  app.get("/api/adminauth/getDashboardData", [authJwt.verifyToken], controller.getDashboardData);


 
  


  // app.post("/api/adminauth/addnewplayer", upload.single("file"), [authJwt.verifyToken], controller.addnewplayer);

  // app.get("/api/adminauth/getplayerlist", [authJwt.verifyToken], controller.getPlayerList);

  // app.post("/api/adminauth/getPlayerDetailsbyMobile", [authJwt.verifyToken], controller.getPlayerDetailsbyMobile);

  // app.post("/api/adminauth/updatePlayerDetailsbyAdmin", [authJwt.verifyToken], controller.updatePlayerDetailsbyAdmin);

  // app.post("/api/adminauth/updatePlayerDetailsbyAdmin", [authJwt.verifyToken], controller.updatePlayerDetailsbyAdmin);

  // app.post("/api/adminauth/updatePlayerProfile", upload.single("file"), [authJwt.verifyToken], controller.updatePlayerProfile);

  // app.post("/api/adminauth/updatePlayerKYC", upload.single("file"), [authJwt.verifyToken], controller.updatePlayerKYC);

  // app.post("/api/adminauth/playerPasswordUpdate", [authJwt.verifyToken], controller.playerPasswordUpdate);

  // app.post("/api/adminauth/playerFeeEntry", [authJwt.verifyToken], controller.playerFeeEntry);

  // app.post("/api/adminauth/getPlayerfeesbyid", [authJwt.verifyToken], controller.getPlayerfeesbyid);

  // app.get("/api/adminauth/getAllPlayerFees", [authJwt.verifyToken], controller.getAllPlayerFees);

  // app.post("/api/adminauth/getPlayerFeeswithDate", [authJwt.verifyToken], controller.getPlayerFeeswithDate);

  // app.get("/api/adminauth/getDashboardData", [authJwt.verifyToken], controller.getDashboardData);

  // app.get("/api/adminauth/getPlayerPendingPaymentList", [authJwt.verifyToken], controller.getPlayerPendingPaymentList);

  // app.post("/api/adminauth/getplayerlistwithpagenumber", [authJwt.verifyToken], controller.getplayerlistwithpagenumber);

  // app.post("/api/adminauth/deletePlayerFee", [authJwt.verifyToken], controller.deletePlayerFee);

  // app.post("/api/adminauth/playerReportEntry", [authJwt.verifyToken], controller.playerReportEntry);

  // app.get("/api/adminauth/getAllPlayerReports", [authJwt.verifyToken], controller.getAllPlayerReports);

  // app.post("/api/adminauth/deletePlayerReports", [authJwt.verifyToken], controller.deletePlayerReports);

  // app.get("/api/adminauth/getAllAccountReports", [authJwt.verifyToken], controller.getAllAccountReports);

  // app.post("/api/adminauth/accountReportEntry", [authJwt.verifyToken], controller.accountReportEntry);

  // app.post("/api/adminauth/getAccountsswithDate", [authJwt.verifyToken], controller.getAccountsswithDate);

  // app.post("/api/adminauth/updateRemark", [authJwt.verifyToken], controller.updateRemark);

};
