var mysql = require("mysq2");
var pool = mysql.createPool({
  host: process.env.MYSQLHOST || "containers-us-west-72.railway.app",
  port:process.env.MYSQLPORT || 7610,
  user:process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "qSljKmIwoPXEFldDNvqV",
  database: process.env.MYSQLDATABASE || "railway",
  connectionLimit: 100,
});



module.exports = pool;
