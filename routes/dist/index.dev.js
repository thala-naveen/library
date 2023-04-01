"use strict";

var express = require('express');

var router = express.Router();

var passport = require('passport');

var fetch = require('cross-fetch');

var pool = require('./pool');

var Country = require('country-state-city').Country;

var State = require('country-state-city').State;

var City = require('country-state-city').City;

var upload = require('./multer');

var session = require('express-session');

var QRCode = require('qrcode');

var aes256 = require('aes256');

var logger = require("./logger");

var ratelimit = require('express-rate-limit');

var bcrypt = require('bcrypt');

var nodemailer = require("nodemailer");

var saltRounds = 10;
var key = "#$fer2rg21440wge0j";
var limiter = ratelimit({
  windowMs: 15 * 60 * 1000,
  // 15 minutes 
  max: 100 //Limit each ip to 100 request per windowsMs

});

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

router.get('/aboutus', limiter, function (req, res) {
  logger.counsellingLogger.log('info', 'ABOUT US PAGE IS RENDERED');
  res.render('aboutus');
});
router.get('/search_by_subject', function (req, res) {
  if (req.session.data || req.session.passport) {
    pool.query('select distinct title,author,subject,publisher,classificationnumber,language,volume from library.books where subject like "%' + req.query.subject + '%" or title like "%' + req.query.subject + '%" or publisher like "%' + req.query.subject + '%" or author like "%' + req.query.subject + '%"', function (error, result) {
      if (error) {
        logger.counsellingLogger.log('error', "".concat(error));
        res.status(500).json([]);
      } else {
        logger.counsellingLogger.log('info', "".concat(req.session.ip1, " ").concat(req.session.loguser, " searched book with info \"").concat(req.query.subject, "\""));
        res.status(200).json(result);
      }
    });
  } else res.redirect('/');
});
router.get('/showsearchbook', function (req, res) {
  if (req.session.data || req.session.passport) {
    // req.session.ip1=req.query.googleip
    logger.counsellingLogger.log('info', "".concat(req.session.ip1, " ").concat(req.session.loguser, " rendered search book page"));
    res.render('searchbook', {
      data: req.session.data
    });
  } else res.redirect('/');
});
router.get('/get_notice_for_users', function (req, res) {
  if (req.session.data || req.session.passport) {
    pool.query('select * from library.notice order by noticeid desc', function (error, result) {
      if (error) {
        logger.counsellingLogger.log('error', "".concat(error));
        res.status(500).json([]);
      } else {
        res.status(200).json(result);
      }
    });
  } else res.redirect('/');
});
router.get('/showreturnhistory', function (req, res) {
  if (req.session.data || req.session.passport) {
    logger.counsellingLogger.log('info', "".concat(req.session.ip1, " ").concat(req.session.loguser, " rendered return history page"));
    res.render('returnhistory', {
      data: req.session.data,
      returndata: []
    });
  } else res.redirect('/');
});
router.get('/get_return_history', function (req, res) {
  if (req.session.data || req.session.passport) {
    pool.query('select * from library.returnmain where cardnumber=?', [req.query.cardnumber], function (error, result) {
      if (error) {
        logger.counsellingLogger.log('error', "".concat(error));
        res.status(500).json([]);
      } else {
        res.status(200).json(result);
      }
    });
  }
});
router.get('/get_issued_books', function (req, res) {
  if (req.session.data || req.session.passport) {
    pool.query('select * from library.issue where cardnumber=?', [req.query.cardnumber], function (error, result) {
      if (error) {
        logger.counsellingLogger.log('error', "".concat(error));
        res.status(500).json([]);
      } else {
        logger.counsellingLogger.log('info', "".concat(req.session.ip1, " ").concat(req.session.loguser, " fetched issued books"));
        res.status(200).json(result);
      }
    });
  }
});
router.post('/showuserprofile', function (req, res) {
  if (req.session.data || req.session.passport) {
    pool.query('select * from library.userdetails where mailid=?', [req.body.showuserprofile], function (error, result) {
      if (error) {
        logger.counsellingLogger.log('error', "".concat(error));
        res.render('profile', {
          msg: 'user not found',
          data: ''
        });
      } else {
        if (result.length == 1) {
          logger.counsellingLogger.log('info', "".concat(req.session.ip1, " ").concat(req.session.loguser, " opened user profile"));
          res.render('profile', {
            data: result[0]
          });
        } else {
          res.render('profile', {
            msg: 'server error',
            data: ''
          });
        }
      }
    });
  } else res.redirect('/');
});
router.post('/checkuser', function (req, res) {
  pool.query('select * from library.userdetails where mailid=?', [req.body.userid], function (error, result) {
    if (error) {
      logger.counsellingLogger.log('error', "".concat(error));
      res.redirect('/');
    } else {
      try {
        // var secretkey = "secret key";
        // var decryptPassword = aes256.decrypt(secretkey,result[0].password);
        ; // true

        if (result.length == 1 && bcrypt.compareSync(req.body.userpassword, result[0].password)) {
          req.session.data = result[0];
          req.session.ip1 = req.body.userip;
          req.session.loguser = req.session.data.firstname;
          logger.counsellingLogger.log('info', "".concat(req.session.ip1, " ").concat(req.session.loguser, " signed in"));
          res.redirect('/userdashboard');
        } else {
          req.session.signinerror = "invalid credentials";
          res.redirect('/');
        }
      } catch (error) {
        req.session.signinerror = "invalid credentials";
        res.redirect('/');
      }
    }
  });
});
router.get('/userdashboard', function (req, res) {
  if (req.session.data || req.session.passport) {
    req.session.ip1 = req.query.googleip; // logger.counsellingLogger.log('info',`${req.session.ip} ${req.session.data.mailid} ${req.session.passport} signed in`)
    // if(req.session.passport)
    // {
    //   req.session.ip1=req.query.googleip
    //   logger.counsellingLogger.log('info',`${req.session.ip1} ${req.session.loguser} render dashboard`)
    // }else
    //   logger.counsellingLogger.log('info',`${req.session.ip1} ${req.session.loguser} render dashboard`)

    logger.counsellingLogger.log('info', "".concat(req.session.ip1, " ").concat(req.session.loguser, " rendered dashboard signed in"));
    res.render('userdashboard', {
      data: req.session.data
    });
  } else {
    res.redirect('/');
  }
});
router.post('/adduser', upload.single('profilepicture'), function (req, res) {
  if (req.session.passport) {
    try {
      var statearr = req.body.state.split('.');
      var state = statearr[2];
      var coursearr = req.body.course.split('#');
      var course = coursearr[1];
    } catch (err) {
      state = '', course = '', req.body.address = '', req.body.city = '', req.body.branch = '', req.body.semester = 0;
      req.body.secondname = req.body.firstname1 + ' ' + req.body.secondname;
    } //  var encryptedpass = aes256.encrypt(key, req.body.password);
    //req.session.ip=req.body.userip


    var hashedpass = bcrypt.hashSync(req.body.password, saltRounds);
    req.session.usernameip = req.body.useremailid;
    pool.query('insert into library.userdetails (mailid,firstname,lastname,address,password,state,city,course,branch,userprofile,dob,semester,role) values(?,?,?,?,?,?,?,?,?,?,?,?,?)', [req.body.useremailid, req.body.firstname, req.body.secondname, aes256.encrypt(key, req.body.address), hashedpass, aes256.encrypt(key, state), aes256.encrypt(key, req.body.city), course, req.body.branch, req.body.profilepic, aes256.encrypt(key, req.body.dob), req.body.semester, req.body.role], function (error, result) {
      if (error) {
        logger.counsellingLogger.log('error', "".concat(error));
        res.redirect('/');
      } else {
        req.session.ip1 = req.body.userip;
        req.session.loguser = req.body.firstname;
        logger.counsellingLogger.log('info', "".concat(req.body.userip, " ").concat(req.body.useremailid, " ").concat(req.body.firstname, " ").concat(req.body.secondname, "  signed up successfully"));
        pool.query('select * from library.userdetails where mailid=?', [req.user.email], function (error, result) {
          if (error) {
            logger.counsellingLogger.log('error', "".concat(error));
            res.redirect('/');
          } else {
            var main = function main() {
              var transporter, info;
              return regeneratorRuntime.async(function main$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      // Generate test SMTP service account from ethereal.email
                      // Only needed if you don't have a real mail account for testing
                      // create reusable transporter object using the default SMTP transport
                      transporter = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        port: 465,
                        auth: {
                          user: "naveenmittal590@gmail.com",
                          pass: "dgttsdheuozkshso"
                        }
                      }); // send mail with defined transport object

                      _context.next = 3;
                      return regeneratorRuntime.awrap(transporter.sendMail({
                        from: "sdc@mitsgwalior.in",
                        // sender address
                        to: "".concat(req.body.useremailid),
                        // list of receivers
                        subject: "Welcome to Library MITS Gwalior",
                        // Subject line
                        // text: `${req.body.remark}`, // plain text body
                        html: " <!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\n                  <html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:o=\"urn:schemas-microsoft-com:office:office\" style=\"font-family:Montserrat, sans-serif\">\n                  <head>\n                  <meta charset=\"UTF-8\">\n                  <meta content=\"width=device-width, initial-scale=1\" name=\"viewport\">\n                  <meta name=\"x-apple-disable-message-reformatting\">\n                  <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n                  <meta content=\"telephone=no\" name=\"format-detection\">\n                  <title>New email template 2023-03-15</title><!--[if (mso 16)]>\n                  <style type=\"text/css\">\n                  a {text-decoration: none;}\n                  </style>\n                  <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>\n                  <xml>\n                  <o:OfficeDocumentSettings>\n                  <o:AllowPNG></o:AllowPNG>\n                  <o:PixelsPerInch>96</o:PixelsPerInch>\n                  </o:OfficeDocumentSettings>\n                  </xml>\n                  <![endif]--><!--[if !mso]><!-- -->\n                  <link href=\"https://fonts.googleapis.com/css2?family=Montserrat&display=swap\" rel=\"stylesheet\"><!--<![endif]--><!--[if !mso]><!-- -->\n                  <link href=\"https://fonts.googleapis.com/css?family=Playfair+Display:400,400i,700,700i\" rel=\"stylesheet\"><!--<![endif]-->\n                  <style type=\"text/css\">\n                  #outlook a {\n                  padding:0;\n                  }\n                  .es-button {\n                  mso-style-priority:100!important;\n                  text-decoration:none!important;\n                  }\n                  a[x-apple-data-detectors] {\n                  color:inherit!important;\n                  text-decoration:none!important;\n                  font-size:inherit!important;\n                  font-family:inherit!important;\n                  font-weight:inherit!important;\n                  line-height:inherit!important;\n                  }\n                  .es-desk-hidden {\n                  display:none;\n                  float:left;\n                  overflow:hidden;\n                  width:0;\n                  max-height:0;\n                  line-height:0;\n                  mso-hide:all;\n                  }\n                  @media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120% } h1 { font-size:62px!important; text-align:center } h2 { font-size:26px!important; text-align:center } h3 { font-size:20px!important; text-align:center } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:62px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:26px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important } .es-menu td a { font-size:12px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:16px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:16px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:12px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class=\"gmail-fix\"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:18px!important; display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0!important } .es-m-p0r { padding-right:0!important } .es-m-p0l { padding-left:0!important } .es-m-p0t { padding-top:0!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-m-p5 { padding:5px!important } .es-m-p5t { padding-top:5px!important } .es-m-p5b { padding-bottom:5px!important } .es-m-p5r { padding-right:5px!important } .es-m-p5l { padding-left:5px!important } .es-m-p10 { padding:10px!important } .es-m-p10t { padding-top:10px!important } .es-m-p10b { padding-bottom:10px!important } .es-m-p10r { padding-right:10px!important } .es-m-p10l { padding-left:10px!important } .es-m-p15 { padding:15px!important } .es-m-p15t { padding-top:15px!important } .es-m-p15b { padding-bottom:15px!important } .es-m-p15r { padding-right:15px!important } .es-m-p15l { padding-left:15px!important } .es-m-p20 { padding:20px!important } .es-m-p20t { padding-top:20px!important } .es-m-p20r { padding-right:20px!important } .es-m-p20l { padding-left:20px!important } .es-m-p25 { padding:25px!important } .es-m-p25t { padding-top:25px!important } .es-m-p25b { padding-bottom:25px!important } .es-m-p25r { padding-right:25px!important } .es-m-p25l { padding-left:25px!important } .es-m-p30 { padding:30px!important } .es-m-p30t { padding-top:30px!important } .es-m-p30b { padding-bottom:30px!important } .es-m-p30r { padding-right:30px!important } .es-m-p30l { padding-left:30px!important } .es-m-p35 { padding:35px!important } .es-m-p35t { padding-top:35px!important } .es-m-p35b { padding-bottom:35px!important } .es-m-p35r { padding-right:35px!important } .es-m-p35l { padding-left:35px!important } .es-m-p40 { padding:40px!important } .es-m-p40t { padding-top:40px!important } .es-m-p40b { padding-bottom:40px!important } .es-m-p40r { padding-right:40px!important } .es-m-p40l { padding-left:40px!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; max-height:inherit!important } }\n                  </style>\n                  </head>\n                  <body data-new-gr-c-s-loaded=\"14.1100.0\" style=\"width:100%;font-family:Montserrat, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0\">\n                  <div class=\"es-wrapper-color\" style=\"background-color:#ECE8DD\"><!--[if gte mso 9]>\n                  <v:background xmlns:v=\"urn:schemas-microsoft-com:vml\" fill=\"t\">\n                  <v:fill type=\"tile\" src=\"https://mnhyyg.stripocdn.email/content/guids/CABINET_f065e32f7fc1208f44642e067d64d1a2/images/17071631173272231.png\" color=\"#ECE8DD\" origin=\"0.5, 0\" position=\"0.5, 0\"></v:fill>\n                  </v:background>\n                  <![endif]-->\n                  <table class=\"es-wrapper\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" background=\"https://mnhyyg.stripocdn.email/content/guids/CABINET_f065e32f7fc1208f44642e067d64d1a2/images/17071631173272231.png\" style=\"mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-image:url(https://mnhyyg.stripocdn.email/content/guids/CABINET_f065e32f7fc1208f44642e067d64d1a2/images/17071631173272231.png);background-repeat:no-repeat;background-position:center center;background-color:#ECE8DD\">\n                  <tr>\n                  <td valign=\"top\" style=\"padding:0;Margin:0\">\n                  <table cellpadding=\"0\" cellspacing=\"0\" class=\"es-header\" align=\"center\" style=\"mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top\">\n                  <tr>\n                  <td align=\"center\" style=\"padding:0;Margin:0\">\n                  <table class=\"es-header-body\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\" style=\"mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;border-top:4px solid #588b8b;border-right:4px solid #588b8b;border-left:4px solid #588b8b;width:600px\">\n                  <tr>\n                  <td align=\"left\" background=\"https://mnhyyg.stripocdn.email/content/guids/CABINET_f065e32f7fc1208f44642e067d64d1a2/images/39821631177477487.png\" style=\"padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;background-image:url(https://mnhyyg.stripocdn.email/content/guids/CABINET_f065e32f7fc1208f44642e067d64d1a2/images/39821631177477487.png);background-repeat:no-repeat;background-position:left top\">\n                  <table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\">\n                  <tr>\n                  <td class=\"es-m-p0r\" valign=\"top\" align=\"center\" style=\"padding:0;Margin:0;width:552px\">\n                  <table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" role=\"presentation\" style=\"mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\">\n                  <tr>\n                  <td align=\"center\" style=\"padding:0;Margin:0;padding-bottom:10px;font-size:0px\"><a target=\"_blank\" href=\"https://viewstripo.email\" style=\"-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#223E3E;font-size:14px\"><img src=\"https://mnhyyg.stripocdn.email/content/guids/CABINET_154fdb9a72c982cb59430413386ebcc920cb98437b20b8f2ff4bc0252810dfbe/images/group_52.png\" alt=\"Logo\" style=\"display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic\" title=\"Logo\" height=\"70\"></a></td>\n                  </tr>\n                  <tr>\n                  <td align=\"center\" style=\"Margin:0;padding-top:5px;padding-bottom:5px;padding-left:20px;padding-right:20px;font-size:0\">\n                  <table border=\"0\" width=\"80%\" height=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\">\n                  <tr>\n                  <td style=\"padding:0;Margin:0;border-bottom:1px solid #223e3e;background:none;height:1px;width:100%;margin:0px\"></td>\n                  </tr>\n                  </table></td>\n                  </tr>\n                  </table></td>\n                  </tr>\n                  </table></td>\n                  </tr>\n                  </table></td>\n                  </tr>\n                  </table>\n                  <table class=\"es-content\" cellspacing=\"0\" cellpadding=\"0\" align=\"center\" style=\"mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%\">\n                  <tr>\n                  <td align=\"center\" style=\"padding:0;Margin:0\">\n                  <table class=\"es-content-body\" style=\"mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;border-right:4px solid #588b8b;border-left:4px solid #588b8b;width:600px;border-bottom:4px solid #588b8b\" cellspacing=\"0\" cellpadding=\"0\" align=\"center\">\n                  <tr>\n                  <td align=\"left\" background=\"https://mnhyyg.stripocdn.email/content/guids/CABINET_f065e32f7fc1208f44642e067d64d1a2/images/39821631177477487.png\" style=\"padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;background-image:url(https://mnhyyg.stripocdn.email/content/guids/CABINET_f065e32f7fc1208f44642e067d64d1a2/images/39821631177477487.png);background-repeat:repeat;background-position:left top\">\n                  <table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\">\n                  <tr>\n                  <td class=\"es-m-p0r es-m-p20b\" valign=\"top\" align=\"center\" style=\"padding:0;Margin:0;width:552px\">\n                  <table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" role=\"presentation\" style=\"mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\">\n                  <tr>\n                  <td align=\"center\" style=\"Margin:0;padding-top:5px;padding-bottom:5px;padding-left:20px;padding-right:20px;font-size:0\">\n                  <table border=\"0\" width=\"10%\" height=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:10% !important;display:inline-table\" role=\"presentation\">\n                  <tr>\n                  <td style=\"padding:0;Margin:0;border-bottom:4px solid #588b8b;background:none;height:1px;width:100%;margin:0px\"></td>\n                  </tr>\n                  </table></td>\n                  </tr>\n                  <tr>\n                  <td align=\"center\" style=\"padding:0;Margin:0;padding-bottom:5px\"><h1 style=\"Margin:0;line-height:17px;mso-line-height-rule:exactly;font-family:'playfair display', georgia, 'times new roman', serif;font-size:14px;font-style:normal;font-weight:bold;color:#C8553D\"><br></h1><p style=\"Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:23px;color:#223E3E;font-size:15px\">WELCOME TO</p><p style=\"Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:23px;color:#223E3E;font-size:15px\">LEARNING RESOURSE CENTER MITS</p><p style=\"Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:23px;color:#223E3E;font-size:15px\"><br></p></td>\n                  </tr>\n                  <tr>\n                  <td align=\"center\" style=\"Margin:0;padding-top:5px;padding-bottom:5px;padding-left:20px;padding-right:20px;font-size:0\">\n                  <table border=\"0\" width=\"10%\" height=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:10% !important;display:inline-table\" role=\"presentation\">\n                  <tr>\n                  <td style=\"padding:0;Margin:0;border-bottom:5px solid #588b8b;background:none;height:1px;width:100%;margin:0px\"></td>\n                  </tr>\n                  </table></td>\n                  </tr>\n                  <tr>\n                  <td align=\"left\" class=\"es-m-p0r es-m-p0l\" style=\"Margin:0;padding-top:10px;padding-bottom:10px;padding-left:40px;padding-right:40px\"><p style=\"Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:27px;color:#223E3E;font-size:18px\">Dear ".concat(req.body.useremailid, "&nbsp;</p><p style=\"Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:27px;color:#223E3E;font-size:18px\">You have successfully signed up for Library MITS.</p><p style=\"Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:27px;color:#223E3E;font-size:18px\"><br></p><p style=\"Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:27px;color:#223E3E;font-size:18px\">The issue status and return history will&nbsp;</p><p style=\"Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:27px;color:#223E3E;font-size:18px\">be shown from 6th Jan 2023.</p><p style=\"Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:27px;color:#223E3E;font-size:18px\"><br></p><p style=\"Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:27px;color:#223E3E;font-size:18px\">You can also check the availability for a book.</p><p style=\"Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:27px;color:#223E3E;font-size:18px\"><br></p><p style=\"Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:27px;color:#223E3E;font-size:18px\">Regards,</p><p style=\"Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:27px;color:#223E3E;font-size:18px\">SOFTWARE DEVELOPMENT CLUB <br></p><p style=\"Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:27px;color:#223E3E;font-size:18px\">MITS GWALIOR&nbsp;</p></td>\n                  </tr>\n                  <tr>\n                  <td align=\"center\" style=\"padding:0;Margin:0;padding-top:20px\"><span class=\"es-button-border\" style=\"border-style:solid;border-color:#2CB543;background:#588b8b;border-width:0px;display:inline-block;border-radius:0px;width:auto;mso-border-alt:10px\"><a href=\"http://library.mitsgwalior.in:4241/\" class=\"es-button es-button-1631175539112\" target=\"_blank\" style=\"mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:18px;display:inline-block;background:#588b8b;border-radius:0px;font-family:Montserrat, sans-serif;font-weight:bold;font-style:normal;line-height:22px;width:auto;text-align:center;padding:15px 45px;border-color:#588b8b\">Go To Library MITS</a></span></td>\n                  </tr>\n                  <tr>\n                  <td align=\"center\" style=\"Margin:0;padding-bottom:5px;padding-top:20px;padding-left:20px;padding-right:20px;font-size:0\">\n                  <table border=\"0\" width=\"80%\" height=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\">\n                  <tr>\n                  <td style=\"padding:0;Margin:0;border-bottom:1px solid #223e3e;background:none;height:1px;width:100%;margin:0px\"></td>\n                  </tr>\n                  </table></td>\n                  </tr>\n                  </table></td>\n                  </tr>\n                  </table></td>\n                  </tr>\n                  <tr>\n                  <td align=\"left\" background=\"https://mnhyyg.stripocdn.email/content/guids/CABINET_f065e32f7fc1208f44642e067d64d1a2/images/39821631177477487.png\" style=\"padding:20px;Margin:0;background-image:url(https://mnhyyg.stripocdn.email/content/guids/CABINET_f065e32f7fc1208f44642e067d64d1a2/images/39821631177477487.png);background-repeat:no-repeat;background-position:left top\"><!--[if mso]><table style=\"width:552px\" cellpadding=\"0\" cellspacing=\"0\"><tr><td style=\"width:190px\" valign=\"top\"><![endif]-->\n                  <table cellpadding=\"0\" cellspacing=\"0\" class=\"es-left\" align=\"left\" style=\"mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left\">\n                  <tr>\n                  <td class=\"es-m-p0r es-m-p20b\" align=\"center\" style=\"padding:0;Margin:0;width:170px\">\n                  <table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" role=\"presentation\" style=\"mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\">\n                  <tr>\n                  <td align=\"center\" style=\"padding:0;Margin:0;font-size:0px\"><a target=\"_blank\" href=\"http://library.mitsgwalior.in:4241/\" style=\"-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#223E3E;font-size:14px\"><img src=\"https://mnhyyg.stripocdn.email/content/guids/CABINET_f065e32f7fc1208f44642e067d64d1a2/images/54761631177511851.png\" alt style=\"display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic\" height=\"80\"></a></td>\n                  </tr>\n                  <tr>\n                  <td align=\"center\" style=\"padding:0;Margin:0;padding-top:10px\"><p style=\"Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:24px;color:#223E3E;font-size:16px\"><a target=\"_blank\" style=\"-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#223e3e;font-size:16px\" href=\"https://viewstripo.email\">Our library</a></p></td>\n                  </tr>\n                  </table></td>\n                  <td class=\"es-hidden\" style=\"padding:0;Margin:0;width:20px\"></td>\n                  </tr>\n                  </table><!--[if mso]></td><td style=\"width:171px\" valign=\"top\"><![endif]-->\n                  <table cellpadding=\"0\" cellspacing=\"0\" class=\"es-left\" align=\"left\" style=\"mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left\">\n                  <tr>\n                  <td class=\"es-m-p0r es-m-p20b\" align=\"center\" style=\"padding:0;Margin:0;width:171px\">\n                  <table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" role=\"presentation\" style=\"mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\">\n                  <tr>\n                  <td align=\"center\" style=\"padding:0;Margin:0;font-size:0px\"><a target=\"_blank\" href=\"https://web.mitsgwalior.in/\" style=\"-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#223E3E;font-size:14px\"><img src=\"https://mnhyyg.stripocdn.email/content/guids/CABINET_f065e32f7fc1208f44642e067d64d1a2/images/48671631177512631.png\" alt style=\"display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic\" height=\"80\"></a></td>\n                  </tr>\n                  <tr>\n                  <td align=\"center\" style=\"padding:0;Margin:0;padding-top:10px\"><p style=\"Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:24px;color:#223E3E;font-size:16px\">College Website</p></td>\n                  </tr>\n                  </table></td>\n                  </tr>\n                  </table><!--[if mso]></td><td style=\"width:20px\"></td><td style=\"width:171px\" valign=\"top\"><![endif]-->\n                  <table cellpadding=\"0\" cellspacing=\"0\" class=\"es-right\" align=\"right\" style=\"mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right\">\n                  <tr>\n                  <td class=\"es-m-p0r\" align=\"center\" style=\"padding:0;Margin:0;width:171px\">\n                  <table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" role=\"presentation\" style=\"mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\">\n                  <tr>\n                  <td align=\"center\" style=\"padding:0;Margin:0;font-size:0px\"><a target=\"_blank\" href=\"http://library.mitsgwalior.in:4241/aboutus\" style=\"-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#223E3E;font-size:14px\"><img src=\"https://mnhyyg.stripocdn.email/content/guids/CABINET_f065e32f7fc1208f44642e067d64d1a2/images/61551631177512631.png\" alt style=\"display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic\" height=\"80\"></a></td>\n                  </tr>\n                  <tr>\n                  <td align=\"center\" style=\"padding:0;Margin:0;padding-top:10px\"><p style=\"Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:24px;color:#223E3E;font-size:16px\">Web Dev Team</p></td>\n                  </tr>\n                  </table></td>\n                  </tr>\n                  </table><!--[if mso]></td></tr></table><![endif]--></td>\n                  </tr>\n                  </table></td>\n                  </tr>\n                  </table>\n                  <table cellpadding=\"0\" cellspacing=\"0\" class=\"es-footer\" align=\"center\" style=\"mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top\">\n                  <tr>\n                  <td align=\"center\" style=\"padding:0;Margin:0\">\n                  <table class=\"es-footer-body\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\" style=\"mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px\">\n                  <tr>\n                  <td align=\"left\" style=\"Margin:0;padding-bottom:10px;padding-top:20px;padding-left:20px;padding-right:20px\">\n                  <table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\">\n                  <tr>\n                  <td align=\"center\" valign=\"top\" style=\"padding:0;Margin:0;width:560px\">\n                  <table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" role=\"presentation\" style=\"mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\">\n                  <tr>\n                  <td align=\"center\" class=\"es-infoblock\" style=\"padding:0;Margin:0;padding-left:40px;padding-right:40px;line-height:14px;font-size:12px;color:#CCCCCC\"><p style=\"Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:14px;color:#999999;font-size:12px\">THIS IS SYSTEM GENERATED EMAIL&nbsp;</p><p style=\"Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:14px;color:#999999;font-size:12px\"><br></p><p style=\"Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:14px;color:#999999;font-size:12px\">PLEASE DON'T REPLY</p></td>\n                  </tr>\n                  </table></td>\n                  </tr>\n                  </table></td>\n                  </tr>\n                  <tr>\n                  <td align=\"left\" style=\"Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px\">\n                  <table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\">\n                  <tr>\n                  <td align=\"left\" style=\"padding:0;Margin:0;width:560px\">\n                  <table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" role=\"presentation\" style=\"mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px\">\n                  <tr>\n                  <td align=\"left\" style=\"padding:0;Margin:0\"><p style=\"Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:21px;color:#333333;font-size:14px\"><br></p></td>\n                  </tr>\n                  </table></td>\n                  </tr>\n                  </table></td>\n                  </tr>\n                  </table></td>\n                  </tr>\n                  </table></td>\n                  </tr>\n                  </table>\n                  </div>\n                  </body>\n                  </html>\n                              ") // html body

                      }));

                    case 3:
                      info = _context.sent;

                    case 4:
                    case "end":
                      return _context.stop();
                  }
                }
              });
            };

            main()["catch"](console.error); // logger.counsellingLogger.log('info', `${req.session.ip} ${req.session.usernameip} dashboard opened `)

            req.session.data = result[0];
            res.redirect('/userdashboard');
          }
        });
      }
    });
  } else {
    res.redirect('/');
  }
});
router.get('/getbranch', function (req, res) {
  if (req.session.passport.user) {
    pool.query('select * from library.branch where courseid=?', [req.query.courseid], function (error, result) {
      if (error) {
        res.status(500).json([]);
      } else {
        res.status(200).json(result);
      }
    });
  } else {
    res.redirect('/');
  }
});
router.get('/getcourse', function (req, res) {
  if (req.session.passport.user) {
    pool.query('select * from library.course', function (error, result) {
      if (error) {
        res.status(500).json([]);
      } else {
        res.status(200).json(result);
      }
    });
  } else {
    res.redirect('/');
  }
});
router.get('/getcities', function (req, res) {
  if (req.session.passport.user) {
    var city = City.getCitiesOfState(req.query.countrycode, req.query.statecode);
    if (city.length >= 1) res.status(200).json(city);else res.status(500).json([]);
  } else {
    res.redirect('/');
  }
});
/* GET home page. */

router.get('/', limiter, function (req, res, next) {
  var session = req.session;
  res.render('index', {
    title: 'Express',
    msg: '',
    signinerror: req.session.signinerror
  });
});
router.get('/auth/google', passport.authenticate('google', {
  scope: ['email', 'profile']
}));
router.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/protected',
  failureRedirect: '/auth/google/failure'
}));
router.get('/protected', isLoggedIn, function (req, res) {
  var states = State.getStatesOfCountry("IN");

  if (req.user._json.domain == "mitsgwl.ac.in") {
    pool.query('select * from library.userdetails where mailid=?', [req.user.email], function (error, result) {
      if (error) {
        logger.counsellingLogger.log('error', "".concat(error));
        res.redirect('/');
      } else {
        if (result.length != 1) {
          res.render('Resgestration', {
            data: req.user,
            states: states,
            role: 'student'
          });
        } else {
          req.session.data = result[0];
          req.session.loguser = result[0].firstname; // logger.counsellingLogger.log('info',`${req.user.email} signed in through google`)

          res.render('userdashboard', {
            data: result[0]
          });
        }
      }
    });
  } else if (req.user._json.domain == "mitsgwalior.in") {
    pool.query('select * from library.userdetails where mailid=?', [req.user.email], function (error, result) {
      if (error) {
        logger.counsellingLogger.log('error', "".concat(error));
      } else {
        if (result.length != 1) res.render('Resgestration', {
          data: req.user,
          states: states,
          role: 'staff'
        });else {
          req.session.data = result[0]; // logger.counsellingLogger.log('info',`${req.user.email} signed in through google`)

          res.render('userdashboard', {
            data: result[0]
          });
        }
      }
    });
  } else {
    req.session.signinerror = "sign Up using institute id only";
    res.redirect('/');
  }
});
router.post('/logout', function (req, res) {
  // logger.counsellingLogger.log('info',`${req.session.data.adminemail} user signed out`)
  logger.counsellingLogger.log('info', "".concat(req.session.ip1, " ").concat(req.session.loguser, " signed out"));
  req.session.destroy(function (err) {
    if (err) {
      return console.log(err);
    } //res.render('index',{msg:'logout Successfull'})


    res.redirect('/');
  }); //res.render('index',{msg:''})
});
router.get('/logout', function (req, res) {
  logger.counsellingLogger.log('info', "".concat(req.session.ip1, " ").concat(req.session.loguser, " signed out"));
  req.session.destroy(function (err) {
    if (err) {
      return console.log(err);
    } //res.render('index',{msg:'logout Successfull'})


    res.redirect('/');
  }); //res.render('index',{msg:''})
});
router.get('/auth/google/failure', function (req, res) {
  res.send('try again! Slow Internet');
});
module.exports = router;