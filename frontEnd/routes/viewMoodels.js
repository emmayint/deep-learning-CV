// display logger when user click link in the email
let express = require("express");
let router = express.Router();
const fs = require("fs");
const db = require("../database/db");
var countFiles = require("count-files");
const mysql = require("mysql");

// http://localhost:5001/logger?projectName=xxxxxxx
router.get("/", function(req, res) {
  if (req.isAuthenticated()) {
    let user = req.user;
    // let modelName = req.query.modelName;
    let projectName = req.query.projectName;
    let sortby = req.query.sortby;

    if (sortby == "date") {
      var sql =
        "SELECT * FROM Models WHERE project_name= " +
        mysql.escape(projectName) +
        "ORDER BY id;";
    } else {
      var sql =
        "SELECT * FROM Models WHERE project_name= " +
        mysql.escape(projectName) +
        "ORDER BY test_accuracy DESC;";
    }
    db.query(sql, function(err, result) {
      if (err) throw err;
      var string = JSON.stringify(result);
      var json = JSON.parse(string);
      // console.log("select *", json[0]);
      var dir0 =
        "./public/allProjects/" +
        req.cookies.userid +
        "/" +
        req.query.projectName +
        "/datasets/" +
        JSON.parse(json[0].classes)[0];
      // console.log("dir0", dir0);
      countFiles(dir0, function(err, results) {
        var size0 = results.files;
        // console.log("size0", size0);

        var dir1 =
          "./public/allProjects/" +
          req.cookies.userid +
          "/" +
          req.query.projectName +
          "/datasets/" +
          JSON.parse(json[0].classes)[1];
        console.log("dir1", dir1);
        countFiles(dir1, function(err, results) {
          var size1 = results.files;
          console.log("size1", size1);
          res.render("viewModels", {
            uname: user.user_name,
            string: string,
            json: json,
            size0: size0,
            size1: size1
          });
        });
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
