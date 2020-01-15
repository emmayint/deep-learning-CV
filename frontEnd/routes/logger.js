// display logger when user click link in the email
let express = require("express");
let router = express.Router();
const fs = require("fs");

// http://localhost:5001/logger?path=xxxxxxx.txt
router.get("/", function(req, res) {
  if (req.isAuthenticated()) {
    let user = req.user;
    let logPath = req.query.path;
    let data = fs.readFileSync(logPath, "utf8");
    res.render("logger", {
      //   modelName: require("./nameModel").modelName,
      uname: user.user_name,
      response: data
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
