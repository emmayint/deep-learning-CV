// display images when user click on a cell in logger page
let express = require("express");
let router = express.Router();
const db = require("../database/db");
const mysql = require("mysql");

// http://localhost:5001/cmcell?modelName=modelName&cmcell=10
router.get("/", function(req, res) {
  if (req.isAuthenticated()) {
    let user = req.user;
    var modelName = req.query.modelName;
    var cell = req.query.cmcell; // "01", "10"...
    console.log("-- cell type", typeof cell);
    console.log("-- cell[0]", cell[0]);
    console.log("-- cell[1]", cell[1]);
    console.log("-- cell[0] === cell[1]", cell[0] === cell[1]);
    if (cell[0] === cell[1]) {
      res.redirect("back");
    } else {
      var imgsStr = "imgs" + req.query.cmcell;
      console.log("-- imgsStr", imgsStr);

      var sql =
        "SELECT " +
        imgsStr +
        ",project_path,classes" +
        " FROM Models WHERE model_fullname = " +
        mysql.escape(modelName);
      console.log("-- sql: ", sql);
      db.query(sql, function(err, result) {
        if (err) throw err;
        var string = JSON.stringify(result);
        console.log("-- string: ", string);
        var json = JSON.parse(string);
        console.log("-- json: ", json);
        console.log("-- json[0]: ", json[0]);
        var imgPath = json[0].project_path + "/testData/";
        imgPath = imgPath.split("public")[1];
        console.log("-- imgPath after splice: ", imgPath);
        var classes = json[0].classes;
        console.log("-- classes: ", typeof classes, classes);
        var value;
        for (var key in json[0]) {
          // console.log("Key: " + key);
          // console.log(key === imgsStr);
          // console.log("Value: " + json[0][key]);
          if (key === imgsStr) {
            value = json[0][key];
          }
        }
        // var value = json[0].imgsStr;
        // var value = Object.values(json[0]);
        console.log("-- value ", value);
        console.log("-- JSON.parse(value): ", JSON.parse(value));
        //   console.log("-- json[0].imgs01: ", json[0].imgs01);
        //   console.log("-- parsed json[0].imgs01: ", JSON.parse(json[0].imgs01));
        res.render("cmcell", {
          modelName: req.query.modelName,
          uname: user.user_name,
          imgPath: imgPath,
          imgsArr: JSON.parse(value),
          classes: classes,
          cell: cell
        });
      });
    }
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
