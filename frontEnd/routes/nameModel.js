let express = require("express");
let router = express.Router();
const axios = require("axios");
const fs = require("fs");
// var selectedModel = require("./selectModel").selectedModel;

router.get("/", function(req, res) {
  var modelName = "";
  if (req.isAuthenticated()) {
    let user = req.user;
    res.render("nameModel", { modelName: modelName, uname: user.user_name });
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
  module.exports.modelName = modelName;
  const body = {
    selectedModel: require("./selectModel").selectedModel,
    projectName: require("./upload").projectName,
    modelName: modelName,
    userid: userid,
    epoch: parseInt(require("./params").epoch),
    optimizer: require("./params").optimizer,
    learningRate: parseFloat(require("./params").learningRate),
    train_batch_size: parseInt(require("./params").train_batch_size),
    test_batch_size: parseInt(require("./params").test_batch_size),
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
