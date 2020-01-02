let express = require("express");
let router = express.Router();
const axios = require("axios");

global.modelName = "";
router.get("/", function(req, res) {
  if (req.isAuthenticated()) {
    let user = req.user;
    res.render("nameModel", { modelName: modelName, uname: user.user_name });
  } else {
    res.redirect("/");
  }
});

router.post("/", function(req, res) {
  let user = req.user;
  modelName = req.body.modelName;
  console.log(modelName);
  console.log("reaching flask");
  const body = {
    selectedModel: selectedModel,
    projectName: projectName,
    modelName: modelName
  };
  console.log("global variables: ", selectedModel, projectName, modelName);
  axios
    .post("http://localhost:8000/train", body)
    .then(res => {
      console.log("flask response: ", res.data);
    })
    .catch(console.log);
  res.render("train", { modelName: modelName, uname: user.user_name });
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

module.exports = router;
