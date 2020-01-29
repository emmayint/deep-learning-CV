let express = require("express");
let router = express.Router();
const fs = require("fs");

router.get("/", function(req, res) {
  var selectedModel = "";
  if (req.isAuthenticated()) {
    let user = req.user;
    userid = user.user_id;
    if (!fs.existsSync("./allProjects/" + userid)) {
      fs.mkdirSync("./allProjects/" + userid, {
        recursive: true
      });
    }
    res.render("selectModel", {
      selectedModel: selectedModel,
      uname: user.user_name
    });
  } else {
    res.redirect("/");
  }
});

router.post("/", function(req, res) {
  var selectedModel = "";
  let user = req.user;
  console.log("post /selectModel with body:", req.body);
  selectedModel = req.body.selectedModel;
  module.exports.selectedModel = selectedModel;
  res.render("selectModel", {
    selectedModel: selectedModel,
    uname: user.user_name
  });
});

// Add mideleware to the route
router.get("/", authenticationMiddleware(), function(req, res) {
  res.render("selectModel");
});

// Auth middleware
function authenticationMiddleware() {
  return (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect("/");
  };
}

module.exports.router = router;
