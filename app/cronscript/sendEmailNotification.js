const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    host: 'mail.agamdigital.in',
    port: 587,
    secure: false,
    auth: {
      user: "mjmanoj11495@gmail.com", 
      pass: "tvtv2341", 
    },
    tls: {
        rejectUnauthorized: false
    }
  });
   
const logger = require("../models/logger.model");

async function sendEmailNotification(userName, toEmail, otp, service){

    var message = "";
    var subject = ""

    switch (service) {
        case 0:
            message = "<p style='font-weight: 500;'>Dear " + userName +",</p>  <p>Your login password has been reset successfully. Please relogin and confirm it on your end. </p> <p>Thanks & Regards,</p> <p style='font-weight: 500;'>Agam Digital Admin</p> <p>Contact Us : +91 9363036369.<p> ";
            subject = "Agam Digital - Password Reset";
            break;
        case 1:
            message = "<p style='font-weight: 500;'>Dear " + userName +",</p>  <p>Your one time password is : " + otp +" . </p> <p>Thanks & Regards,</p> <p style='font-weight: 500;'>Agam Digital Admin</p> <p>Contact Us : +91 9363036369.<p> ";
            subject = "Agam Digital - Forgot Password";
            break;
        case 2:
            message = "<p style='font-weight: 500;'>Dear " + userName +",</p>  <p> Your plan upgrade has been approved. Please relogin and confirm from your end. If there is any difficulty, please contact admin immediately. </p> <p>Thanks & Regards,</p> <p style='font-weight: 500;'>Agam Digital Admin</p> <p>Contact Us : +91 9363036369.<p> ";
            subject = "Agam Digital - Plan Upgarde Approval";
            break;
        case 3:
            message = "<p style='font-weight: 500;'>Dear " + userName +",</p>  <p> Your withdrawal request has been approved. Please confirm from your end. If there is any difficulty, please contact admin immediately. </p> <p>Thanks & Regards,</p> <p style='font-weight: 500;'>Agam Digital Admin</p> <p>Contact Us : +91 9363036369.<p> ";
            subject = "Agam Digital - Withdrawal Approval";
            break;
        case 4:
            message = "<p style='font-weight: 500;'>Dear " + userName +",</p>  <p> Your plan upgrade has been submitted successfully. Please wait for admin approvals. </p> <p>Thanks & Regards,</p> <p style='font-weight: 500;'>Agam Digital Admin</p> <p>Contact Us : +91 9363036369.<p> ";
            subject = "Agam Digital - Plan Upgarde Request";
            break;
        case 5:
            message = "<p style='font-weight: 500;'>Dear " + userName +",</p>  <p> Your withdrawal request has been submitted successfully. Please wait for admin approvals. </p> <p>Thanks & Regards,</p> <p>Agam Digital Admin</p> <p>Contact Us : +91 9363036369.<p> ";
            subject = "Agam Digital - Withdrawal Request";
            break;
        case 6:
            message = "<p style='font-weight: 500;'>Dear " + userName +",</p>  <p> Your plan upgrade has been rejected. Please contact admin for more details. </p> <p>Thanks & Regards,</p> <p style='font-weight: 500;'>Agam Digital Admin</p> <p>Contact Us : +91 9363036369.<p> ";
            subject = "Agam Digital - Plan Upgarde Rejected";
            break;
        case 7:
            message = "<p style='font-weight: 500;'>Dear " + userName +",</p>  <p> Your withdrawal request has been rejected. Please contact admin for more details. </p> <p>Thanks & Regards,</p> <p style='font-weight: 500;'>Agam Digital Admin</p> <p>Contact Us : +91 9363036369.<p> ";
            subject = "Agam Digital - Withdrawal Rejected";
            break;

    }

    let info = await transporter.sendMail({
        from: "admin@agamdigital.in",
        to: toEmail,
        subject: subject, 
        html: message, 
    });
    
    logger.info("Email Notification Triggered Successfully : ", {response: info.messageId, content:message, toSend: toEmail});
}

module.exports = { sendEmailNotification };