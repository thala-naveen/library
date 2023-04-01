var mysql = require("mysql");
var pool = mysql.createPool({
  host: process.env.MYSQLHOST || "localhost",
  port:process.env.MYSQLPORT || 3306,
  user:process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "1234",
  database: process.env.MYSQLDATABASE || "library",
  connectionLimit: 100,
});

module.exports = pool;
