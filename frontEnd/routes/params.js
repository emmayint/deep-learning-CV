let express = require("express");
let router = express.Router();
const fs = require("fs");
var countFiles = require("count-files");

router.get("/", function(req, res) {
  var epoch = 9;
  var optimizer = "Adam";
  var learningRate = 0.0001;
  var train_batch_size = 0;
  var test_batch_size = 0;
  train_batch_size = Math.sqrt(require("./upload").trainSize * 0.75).toFixed(0);
  test_batch_size = Math.sqrt(require("./upload").testSize).toFixed(0);

  if (req.isAuthenticated()) {
    let user = req.user;
    res.render("params", {
      projectName: require("./upload").projectName,
      trainSize: require("./upload").trainSize,
      testSize: require("./upload").testSize,
      epoch: epoch,
      uname: user.user_name,
      train_batch_size: train_batch_size,
      test_batch_size: test_batch_size,
      optimizer: optimizer,
      learningRate: learningRate
    });
  } else {
    // res.redirect("/");
  }
});

router.post("/", function(req, res) {
  var epoch = 9;
  var optimizer = "Adam";
  var learningRate = 0.0001;
  var train_batch_size = 0;
  var test_batch_size = 0;
  //   res.render("selectModel", {});
  let user = req.user;
  epoch = req.body.epoch;
  module.exports.epoch = epoch;
  train_batch_size = req.body.train_batch_size;
  module.exports.train_batch_size = train_batch_size;
  test_batch_size = req.body.test_batch_size;
  module.exports.test_batch_size = test_batch_size;
  optimizer = req.body.optimizer;
  module.exports.optimizer = optimizer;
  learningRate = req.body.learningRate;
  module.exports.learningRate = learningRate;
  res.render("params", {
    projectName: require("./upload").projectName,
    trainSize: require("./upload").trainSize,
    testSize: require("./upload").testSize,
    epoch: epoch,
    uname: user.user_name,
    train_batch_size: train_batch_size,
    test_batch_size: test_batch_size,
    optimizer: optimizer,
    learningRate: learningRate
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

module.exports.router = router;
