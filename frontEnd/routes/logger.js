// display logger when user click link in the email
let express = require("express");
let router = express.Router();
const fs = require("fs");

// http://localhost:5001/logger?modelName=xxxxxxx
router.get("/", function(req, res) {
  if (req.isAuthenticated()) {
    let user = req.user;
    let modelName = req.query.modelName;

    // let logPath = req.query.path;
    // let cm_string = req.query.cm_string;
    // console.log("--cm_string:", cm_string);
    // let labels_string = req.query.labels_string;
    // console.log("--labels_string:", labels_string);
    // let data = fs.readFileSync(logPath, "utf8");

    const mysql = require("mysql");
    const db = require("../database/db");

    var sql =
      "SELECT project_path, cm, classes, project_name, model_path, log_path, test_accuracy, selected_model, epoch, train_size, exp_id FROM Models WHERE model_fullname = " +
      mysql.escape(modelName);
    db.query(sql, function(err, result) {
      if (err) throw err;
      console.log("--Data received from Db");
      var string = JSON.stringify(result);
      var json = JSON.parse(string);
      console.log(">> json: ", json);
      console.log(">> Model.cm: ", json[0].cm);
      console.log(">> Model.labels: ", JSON.stringify(json[0].classes));
      // var logPath = json[0].project_path + "/models/" + modelName + ".txt";
      var logPath = json[0].log_path;
      console.log(">> Model.logpath: ", logPath);
      var array = logPath.split("public");
      console.log(">> Model.logpath arr: ", array[1]);
      console.log(">> json[0].train_size: ", json[0].train_size);

      var data = fs.readFileSync(logPath, "utf8");
      res.render("logger", {
        modelName: req.query.modelName,
        uname: user.user_name,
        response: data,
        cm_string: json[0].cm,
        labels_string: JSON.stringify(json[0].classes), //"[\"control\", \"mutant\"]"
        project_name: json[0].project_name,
        test_accuracy: json[0].test_accuracy,
        logPath: array[1],
        epoch: json[0].epoch,
        train_size: json[0].train_size,
        selected_model: json[0].selected_model,
        exp_id: json[0].exp_id
      });
    });
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
