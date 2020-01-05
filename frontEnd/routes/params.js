let express = require("express");
let router = express.Router();

global.epoch = 9;
global.batch_size = 4;
global.steps_per_epoch = 10;
global.optimizer = "Adam";
global.learningRate = 0.0001;

router.get("/", function(req, res) {
  if (req.isAuthenticated()) {
    let user = req.user;
    //   res.render("selectModel", {});
    res.render("params", { epoch: epoch, uname: user.user_name });
  } else {
    res.redirect("/");
  }
});

router.post("/", function(req, res) {
  //   res.render("selectModel", {});
  let user = req.user;
  epoch = req.body.epoch;
  batch_size = req.body.batch_size;
  steps_per_epoch = req.body.steps_per_epoch;
  res.render("params", {
    epoch: epoch,
    batch_size: batch_size,
    steps_per_epoch: steps_per_epoch,
    uname: user.user_name
  });
});

// Add mideleware to the route
router.get("/", authenticationMiddleware(), function(req, res) {
  res.render("params");
});

// Auth middleware
function authenticationMiddleware() {
  return (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect("/");
  };
}

module.exports = router;
