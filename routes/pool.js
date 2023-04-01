var mysql = require("mysql");
var pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port:process.env.DB_PORT || 3306,
  user:process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "library",
  connectionLimit: 100,
});

module.exports = pool;
