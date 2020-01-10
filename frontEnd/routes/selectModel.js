let express = require("express");
let router = express.Router();

global.selectedModel = "";

router.get("/", function(req, res) {
  if (req.isAuthenticated()) {
    let user = req.user;
    console.log("User in selectModle: ", user);
    res.render("selectModel", {
      selectedModel: selectedModel,
      uname: user.user_name
    });
  } else {
    res.redirect("/");
  }
});

router.post("/", function(req, res) {
  let user = req.user;
  console.log("post /selectModel with body:", req.body);
  selectedModel = req.body.selectedModel;
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

module.exports = router;