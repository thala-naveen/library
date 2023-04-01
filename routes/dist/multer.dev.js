"use strict";

var multer = require("multer");

var serverpath = multer.diskStorage({
  destination: function destination(req, file, path) {
    path(null, "public/files");
  },
  filename: function filename(req, file, path) {
    path(null, file.originalname);
  }
});
var upload = multer({
  storage: serverpath
});
module.exports = upload;