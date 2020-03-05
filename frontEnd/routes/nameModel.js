let express = require("express");
let router = express.Router();
const axios = require("axios");
const fs = require("fs");
const db = require("../database/db");

router.get("/", function(req, res) {
  var modelName = "";
  const mysql = require("mysql");

  if (req.isAuthenticated()) {
    let user = req.user;
    var sql = "SELECT model_fullname FROM Models";
    db.query(sql, function(err, result) {
      if (err) throw err;
      console.log("-- Data received from Db");
      var string = JSON.stringify(result);
      var json = JSON.parse(string);
      console.log("-- json: ", json);
      res.render("nameModel", {
        modelName: modelName,
        uname: user.user_name,
        json: json
      });
    });
  } else {
    res.redirect("/");
  }
});

// router.post("/", async function(req, res) {
router.post("/", function(req, res) {
  var modelName = "";
  let isLoading = true;
  let user = req.user;
  console.log(user);
  let userid = user.user_id;
  let useremail = user.user_email;
  // console.log("user: ", user);
  modelName = req.body.modelName;
  // module.exports.modelName = modelName;
  const body = {
    // selectedModel: require("./selectModel").selectedModel,
    selectedModel: req.cookies.selectedModel,
    projectName: req.cookies.projectName,
    modelName: modelName,
    userid: userid,
    epoch: req.cookies.epoch,
    optimizer: req.cookies.optimizer,
    learningRate: req.cookies.learningRate,
    train_batch_size: req.cookies.train_batch_size,
    test_batch_size: req.cookies.test_batch_size,
    useremail: useremail
  };
  console.log(useremail);
  // try {
  console.log("reaching flask");
  // const api_res = await axios.post("http://localhost:5000/train", body);
  const api_res = axios
    .post("http://localhost:5000/train", body)
    .then(res => {
      console.log("flask response: ", res.data);
    })
    .catch(console.log);
  // const flask_response = api_res.data;
  // let data = fs.readFileSync(flask_response.log, "utf8");
  res.render("train", {
    modelName: modelName,
    uname: user.user_name,
    useremail: useremail
    // response: data
  });
  // } catch (err) {
  //   console.log(err);
  // }
});

// Add mideleware to the route
router.get("/", authenticationMiddleware(), function(req, res) {
  res.render("nameModel");
});

// Auth middleware
function authenticationMiddleware() {
  return (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect("/");
  };
}

module.exports.router = router;
