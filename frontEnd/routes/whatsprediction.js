let express = require("express");
let router = express.Router();
const fs = require("fs");

router.get("/", function(req, res) {
  let user = req.user;
  if (req.isAuthenticated()) {
    res.render("whatsprediction", {
      // selectedModel: selectedModel,
      uname: user.user_name
    });
  } else {
    res.redirect("/");
  }
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
