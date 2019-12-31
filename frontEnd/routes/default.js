let express = require("express");
let router = express.Router();

// @route   POST /logout
// @desc    Logout current user and redirect to the sign in page
// @access  Private
router.get("/", function(req, res, next) {
  console.log("in default page");
  if (req.isAuthenticated()) {
    let user = req.user;
    console.log("User: ", user);
    res.render("default", { uname: user.user_name });
  } else {
    res.redirect("/");
  }
});

// Add mideleware to the route
router.get("/", authenticationMiddleware(), function(req, res) {
  res.render("default");
});

// Auth middleware
function authenticationMiddleware() {
  return (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect("/");
  };
}

module.exports = router;
