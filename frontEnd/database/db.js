let mysql = require("mysql");

let connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "csc899"
});

// let connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "crest@123",
//   database: "csc899"
// });

connection.connect();

module.exports = connection;
