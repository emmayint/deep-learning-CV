// display logger when user click link in the email
let express = require("express");
let router = express.Router();
const fs = require("fs");
const db = require("../database/db");

// http://localhost:5001/logger?projectName=xxxxxxx
router.get("/", function(req, res) {
  if (req.isAuthenticated()) {
    let user = req.user;
    // let modelName = req.query.modelName;
    let projectName = req.query.projectName;

    const mysql = require("mysql");

    var sql2 =
      "SELECT project_name, model_fullname, test_accuracy, epoch, train_size, optimizer, learning_rate, timestamp FROM Models WHERE project_name= " +
      mysql.escape(projectName);
    db.query(sql2, function(err, result) {
      if (err) throw err;
      var string = JSON.stringify(result);
      var json = JSON.parse(string);

      res.render("viewModels", {
        uname: user.user_name,
        string: string,
        json: json
      });
    });
    // });
  } else {
    res.redirect("/");
  }
});

// Add mideleware to the route
router.get("/", authenticationMiddleware(), function(req, res) {
  res.render("logger");
});

// Auth middleware
function authenticationMiddleware() {
  return (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect("/");
  };
}

module.exports = router;
