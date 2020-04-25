let mysql = require("mysql");

let connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// let connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "crest@123",
//   database: "csc899"
// });

connection.connect();

module.exports = connection;
