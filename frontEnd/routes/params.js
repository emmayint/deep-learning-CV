let express = require("express");
let router = express.Router();
const fs = require("fs");
var countFiles = require("count-files");

router.get("/", function(req, res) {
  var traindir =
    "./public/allProjects/" +
    req.cookies.userid +
    "/" +
    req.cookies.projectName +
    "/datasets";
  var testdir =
    "./public/allProjects/" +
    req.cookies.userid +
    "/" +
    req.cookies.projectName +
    "/testData";
  countFiles(traindir, function(err, results) {
    var trainSize = results.files;
    res.cookie("trainSize", trainSize);
    console.log("fs trainSize", trainSize);
    countFiles(testdir, function(err, results) {
      var testSize = results.files;
      res.cookie("testSize", testSize);
      console.log("fs testSize", testSize);
      if (req.isAuthenticated()) {
        let user = req.user;
        var defaultEpoch = 0;
        if (0 < trainSize < 200) {
          defaultEpoch = 30;
        } else if (200 <= trainSize < 500) {
          defaultEpoch = 20;
        } else if (500 <= trainSize) {
          defaultEpoch = 10;
        }

        res.render("params", {
          userid: req.cookies.userid,
          projectName: req.cookies.projectName,
          // trainSize: req.cookies.trainSize ? req.cookies.trainSize : trainSize,
          trainSize: trainSize,
          // testSize: req.cookies.testSize ? req.cookies.testSize : testSize,
          testSize: testSize,
          epoch: req.cookies.epoch == -1 ? defaultEpoch : req.cookies.epoch,
          uname: user.user_name,
          train_batch_size:
            req.cookies.train_batch_size != -1
              ? req.cookies.train_batch_size
              : Math.sqrt(trainSize * 0.75).toFixed(0),
          validation_batch_size:
            req.cookies.train_batch_size != -1
              ? req.cookies.train_batch_size
              : Math.sqrt(trainSize * 0.25).toFixed(0),
          test_batch_size:
            req.cookies.test_batch_size != -1
              ? req.cookies.test_batch_size
              : testSize,
          // : Math.sqrt(testSize).toFixed(0),
          optimizer: req.cookies.optimizer ? req.cookies.optimizer : "Adam",
          learningRate: req.cookies.learningRate
            ? req.cookies.learningRate
            : 0.0001
        });
      } else {
        // res.redirect("/");
      }
    });
  });
});

// router.get("/", function(req, res) {
//   var trainSize;
//   var testSize;
//   var traindir =
//     "./public/allProjects/" +
//     req.cookies.userid +
//     "/" +
//     req.cookies.projectName +
//     "/datasets";
//   var testdir =
//     "./public/allProjects/" +
//     req.cookies.userid +
//     "/" +
//     req.cookies.projectName +
//     "/testData";
//   countFiles(traindir, function(err, results) {
//     trainSize = results.files;
//   });
//   // train_batch_size = Math.sqrt(trainSize).toFixed(0);
//   countFiles(testdir, function(err, results) {
//     testSize = results.files;
//   });

//   var trainSize = req.cookies.trainSize
//     ? req.cookies.trainSize
//     : require("./upload").trainSize;
//   res.cookie("trainSize", trainSize);

//   var testSize = req.cookies.testSize
//     ? req.cookies.testSize
//     : require("./upload").testSize;
//   res.cookie("testSize", testSize);

//   if (req.isAuthenticated()) {
//     let user = req.user;
//     res.render("params", {
//       userid: req.cookies.userid,
//       projectName: req.cookies.projectName,
//       // trainSize: req.cookies.trainSize ? req.cookies.trainSize : trainSize,
//       testSize: req.cookies.testSize ? req.cookies.testSize : testSize,
//       epoch: req.cookies.epoch ? req.cookies.epoch : 9,
//       uname: user.user_name,
//       train_batch_size: req.cookies.train_batch_size
//         ? req.cookies.train_batch_size
//         : Math.sqrt(trainSize * 0.75).toFixed(0),
//       test_batch_size: req.cookies.test_batch_size
//         ? req.cookies.test_batch_size
//         : Math.sqrt(testSize),
//       optimizer: req.cookies.optimizer ? req.cookies.optimizer : "Adam",
//       learningRate: req.cookies.learningRate ? req.cookies.learningRate : 0.0001
//     });
//   } else {
//     // res.redirect("/");
//   }
// });

router.post("/", function(req, res) {
  console.log("get params cookies.trainSize ", req.cookies.trainSize);
  var trainSize = req.cookies.trainSize;
  var testSize = req.cookies.testSize;
  // res.cookie("trainSize", trainSize);
  // res.cookie("testSize", testSize);
  let user = req.user;

  epoch = req.body.epoch;
  res.cookie("epoch", epoch);
  train_batch_size = req.body.train_batch_size;
  res.cookie("train_batch_size", req.body.train_batch_size);
  res.cookie("validation_batch_size", req.body.validation_batch_size);
  test_batch_size = req.body.testSize;
  res.cookie("test_batch_size", req.body.test_batch_size);
  optimizer = req.body.optimizer;
  res.cookie("optimizer", optimizer);
  learningRate = req.body.learningRate;
  res.cookie("learningRate", learningRate);

  res.redirect("/params");
  // res.render("params"
  // , {
  //   projectName: req.cookies.projectName,
  //   trainSize: req.cookies.trainSize ? req.cookies.trainSize : trainSize,
  //   testSize: req.cookies.testSize ? req.cookies.testSize : testSize,
  //   epoch: req.body.epoch,
  //   uname: user.user_name,
  //   train_batch_size: req.body.train_batch_size,
  //   validation_batch_size: req.body.train_batch_size,
  //   test_batch_size: req.body.test_batch_size,
  //   optimizer: req.body.optimizer,
  //   learningRate: req.body.learningRate
  // });
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
