let express = require("express");
let router = express.Router();
const fs = require("fs");
var countFiles = require("count-files");

global.epoch = 9;
// global.batch_size = 4;
// global.steps_per_epoch = 10;
global.optimizer = "Adam";
global.learningRate = 0.0001;

// function setBatches(req, res, next) {
//   var traindir = "./allProjects/" + projectName + "/datasets";
//   var testdir = "./allProjects/" + projectName + "/testData";
//   countFiles(traindir, function(err, results) {
//     trainSize = results.files - 1;
//   });
//   countFiles(testdir, function(err, results) {
//     testSize = results.files - 1;
//   });
//   train_batch_size = Math.sqrt(trainSize).toFixed(0);
//   test_batch_size = Math.sqrt(testSize).toFixed(0);
//   next();
// }

router.get("/", function(req, res) {
  train_batch_size = Math.sqrt(trainSize).toFixed(0);
  test_batch_size = Math.sqrt(testSize).toFixed(0);

  if (req.isAuthenticated()) {
    let user = req.user;
    res.render("params", {
      trainSize: trainSize,
      testSize: testSize,
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
  //   res.render("selectModel", {});
  let user = req.user;
  epoch = req.body.epoch;
  train_batch_size = req.body.train_batch_size;
  test_batch_size = req.body.test_batch_size;
  optimizer = req.body.optimizer;
  learningRate = req.body.learningRate;
  res.render("params", {
    trainSize: trainSize,
    testSize: testSize,
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

module.exports = router;
