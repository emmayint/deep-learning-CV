let express = require("express");
let router = express.Router();
let multer = require("multer");
let path = require("path");
var fs = require("fs");
var countFiles = require("count-files");

// const db = require('../database/db');

global.projectName;
global.trainSize = 0;
global.testSize = 0;
global.train_batch_size = 10;
global.test_batch_size = 4;
var projectName;
var selectedCategory = "";
var selectedDir = "";
// var hasTestDir = false;
var trainfiles = [];

// Setting up upload function using multer
let uploadTrain = multer({
  storage: multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, selectedDir);
    },
    filename: (req, file, cb) => {
      console.log(file.originalname);
      cb(null, path.basename(file.originalname));
    }
  })
});

router.post("/createFile", uploadTrain.array("file", 40), function(req, res) {
  var traindir = "./allProjects/" + userid + "/" + projectName + "/datasets";
  var testdir = "./allProjects/" + userid + "/" + projectName + "/testData";
  countFiles(traindir, function(err, results) {
    trainSize = results.files;
  });
  train_batch_size = Math.sqrt(trainSize).toFixed(0);
  countFiles(testdir, function(err, results) {
    testSize = results.files;
  });
  test_batch_size = Math.sqrt(testSize).toFixed(0);
  res.redirect("/upload");
  // res.send("uploaded file");
});

// TODO Add middleware to the route
router.get("/", function(req, res) {
  // display all categories in current project
  if (req.isAuthenticated()) {
    let allProjectBuf = Buffer.from("./allProjects/" + userid);
    let user = req.user;
    fs.readdir(allProjectBuf, (err, projects) => {
      // get all exixting projects
      if (err) {
        console.log(err.message);
      } else {
        if (projectName) {
          // when a project is selected
          let projectBuf = Buffer.from(
            "./allProjects/" + userid + "/" + projectName
          );
          fs.readdir(projectBuf, (err, files) => {
            if (err) {
              console.log(err.message);
            } else {
              if (files.includes("testData")) {
                hasTestDir = true;
              } else {
                hasTestDir = false;
              }
            }
          });
          // if a project is created or selected, show all categories under its datasets
          let dirBuf = Buffer.from(
            "./allProjects/" + userid + "/" + projectName + "/datasets"
          );
          fs.readdir(dirBuf, (err, files) => {
            if (err) {
              console.log(err.message);
            } else {
              trainfiles = files;
              res.render("upload", {
                projects: projects,
                trainfiles: trainfiles,
                projectName: projectName,
                selectedDir: selectedDir,
                uname: user.user_name
              });
            }
          });
        } else {
          res.render("upload", {
            projects: projects,
            trainfiles: trainfiles,
            projectName: projectName,
            selectedDir: selectedDir,
            uname: user.user_name
          });
        }
      }
    });
  } else {
    res.redirect("/");
  }
});

router.post("/nameProject", function(req, res) {
  console.log("post /nameProject with body:", req.body);
  projectName = req.body.projectName;
  global.projectName = projectName;

  console.log("projectName: ", projectName);

  if (
    !fs.existsSync("./allProjects/" + userid + "/" + projectName + "/datasets")
  ) {
    fs.mkdirSync("./allProjects/" + userid + "/" + projectName + "/datasets", {
      recursive: true
    });
  }
  if (
    !fs.existsSync("./allProjects/" + userid + "/" + projectName + "/testData")
  ) {
    fs.mkdirSync("./allProjects/" + userid + "/" + projectName + "/testData", {
      recursive: true
    });
  }
  if (
    !fs.existsSync("./allProjects/" + userid + "/" + projectName + "/models")
  ) {
    fs.mkdirSync("./allProjects/" + userid + "/" + projectName + "/models", {
      recursive: true
    });
  }

  res.redirect("/upload");
});

// create categories in each project /datasets and /testData
router.post("/createDir", function(req, res) {
  console.log("post /createDir, ", "body:", req.body);
  category = req.body.category;
  console.log(
    "creating dir: ",
    "./allProjects/" + userid + "/" + projectName + "/datasets/" + category
  );

  if (
    !fs.existsSync(
      "./allProjects/" + userid + "/" + projectName + "/datasets/" + category
    )
  ) {
    fs.mkdirSync(
      "./allProjects/" + userid + "/" + projectName + "/datasets/" + category,
      {
        recursive: true
      }
    );
  }
  if (
    !fs.existsSync(
      "./allProjects/" + userid + "/" + projectName + "/testData/" + category
    )
  ) {
    fs.mkdirSync(
      "./allProjects/" + userid + "/" + projectName + "/testData/" + category,
      {
        recursive: true
      }
    );
  }
  res.redirect("/upload");
});

// TODO select from testData
// select a category directory to upload
router.post("/selectDir", function(req, res) {
  console.log("post /selectDir, ", "body:", req.body);
  selectedCategory = req.body.category;
  selectedDir =
    "./allProjects/" +
    userid +
    "/" +
    projectName +
    "/datasets/" +
    selectedCategory;
  console.log("selected ", selectedDir);
  res.redirect("/upload");
});

router.post("/selectTestDir", function(req, res) {
  console.log("post /selectTestDir, ", "body:", req.body);
  selectedCategory = req.body.category;
  selectedDir =
    "./allProjects/" +
    userid +
    "/" +
    projectName +
    "/testData/" +
    selectedCategory;
  console.log("selected ", selectedDir);
  res.redirect("/upload");
});

// select a project
router.post("/selectProject", function(req, res) {
  console.log("post /selectProject with body:", req.body);
  projectName = req.body.projectName;
  global.projectName = projectName;
  var traindir = "./allProjects/" + userid + "/" + projectName + "/datasets";
  var testdir = "./allProjects/" + userid + "/" + projectName + "/testData";
  countFiles(traindir, function(err, results) {
    trainSize = results.files;
  });
  train_batch_size = Math.sqrt(trainSize).toFixed(0);
  countFiles(testdir, function(err, results) {
    testSize = results.files;
  });
  test_batch_size = Math.sqrt(testSize).toFixed(0);
  // TODO check and set value for hasTestDir
  res.redirect("/upload");
});

// pop up window
// router.get("/createFile", function(req, res) {
//   console.log("get /createFile,", "selectedDir:", selectedDir);
//   res.render("createFile", { selectedDir: selectedDir });
// });

// router.post("/createTestDir", function(req, res) {
//   console.log("post /createTestDir, ", "body:", req.body);
//   console.log("creating dir: ", "./allProjects/" + userid + "/" + projectName + "/testData");

//   if (!fs.existsSync("./allProjects/" + userid + "/" + projectName + "/testData")) {
//     fs.mkdirSync("./allProjects/" + userid + "/" + projectName + "/testData", {
//       recursive: true
//     });
//   }
//   hasTestDir = true;

//   let dirBuf = Buffer.from("./allProjects/" + userid + "/" + projectName + "/datasets");
//   fs.readdir(dirBuf, (err, files) => {
//     if (err) {
//       console.log(err.message);
//     } else {
//       // propagate all categories in datasets(train) to testData
//       files.forEach(function(file) {
//         if (
//           !fs.existsSync("./allProjects/" + userid + "/" + projectName + "/testData/" + file)
//         ) {
//           fs.mkdirSync("./allProjects/" + userid + "/" + projectName + "/testData/" + file, {
//             recursive: true
//           });
//         }
//       });
//     }
//   });
//   res.redirect("/upload");
// });

// Add mideleware to the route
router.get("/", authenticationMiddleware(), function(req, res) {
  res.render("upload");
});

// router.post("/setBatchSize", function(req, res) {
// });

// Auth middleware
function authenticationMiddleware() {
  return (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect("/");
  };
}

module.exports = router;
// module.exports.projectName = projectName;
