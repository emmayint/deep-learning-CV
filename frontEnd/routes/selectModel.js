let express = require("express");
let router = express.Router();
const fs = require("fs");

router.get("/", function(req, res) {
  // var selectedModel = "";
  if (req.isAuthenticated()) {
    let user = req.user;
    userid = user.user_id;
    res.cookie("userid", userid);
    res.cookie("selectedModel", "VGG16");
    // res.cookie("selectedModel", "");
    if (!fs.existsSync("./public/allProjects/" + userid)) {
      fs.mkdirSync("./public/allProjects/" + userid, {
        recursive: true
      });
    }
    res.render("selectModel", {
      // selectedModel: selectedModel,
      selectedModel: req.cookies.selectedModel,
      uname: user.user_name
    });
  } else {
    res.redirect("/");
  }
});

router.post("/", function(req, res) {
  let user = req.user;
  res.cookie("selectedModel", "VGG16");
  // res.cookie("selectedModel", req.body.selectedModel);
  res.render("selectModel", {
    selectedModel: "VGG16",
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
