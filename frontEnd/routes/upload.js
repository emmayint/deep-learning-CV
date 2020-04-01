let express = require("express");
let router = express.Router();
let multer = require("multer");
let path = require("path");
var fs = require("fs");
var countFiles = require("count-files");

// var selectedModel = require("./selectModel").selectedModel;
// console.log("selectedModel imported ", selectedModel);
const db = require("../database/db");
const mysql = require("mysql");

// Setting up upload function using multer
let uploadTrain = multer({
  storage: multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, req.cookies.selectedDir);
    },
    filename: (req, file, cb) => {
      // console.log("uploading", file.originalname);
      cb(null, path.basename(file.originalname));
    }
  })
});

router.post("/createFile", uploadTrain.array("file", 200), function(req, res) {
  let json;
  if (req.cookies.selectTestDir == 1) {
    // add images to experiment_images table
    let user = req.user;
    let expTitle = req.cookies.projectName + "-testData";
    var sql =
      "SELECT exp_id FROM experiments WHERE exp_title = " +
      mysql.escape(expTitle);
    db.query(sql, function(err, result) {
      var string = JSON.stringify(result);
      json = JSON.parse(string);
      // insert uploaded image files
      let now = new Date(new Date().toString().split("GMT")[0] + " UTC")
        .toISOString()
        .split(".")[0]
        .replace("T", "-");

      let fileLength = req.files.length;
      let text = "";
      for (let i = 0; i < fileLength; i++) {
        let fileName = req.files[i].filename;
        text += fileName + ",";
      }

      let removedLastComma = text.substring(0, text.length - 1);
      let array = removedLastComma.split(",");
      for (let k = 0; k < array.length; k++) {
        db.query(
          "INSERT IGNORE INTO experiment_images (exp_id, user_id, exp_images, created_at, label, exp_type, img_dir) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            json[0].exp_id,
            user.user_id,
            array[k],
            now,
            req.cookies.selectedCategory,
            "T",
            req.cookies.selectedDir + "/" + array[k]
          ]
        );
      }
    });
  }
  res.redirect("/upload");
});

router.get("/", function(req, res) {
  // display all categories in current project
  if (req.isAuthenticated()) {
    let allProjectBuf = Buffer.from(
      "./public/allProjects/" + req.cookies.userid
    );
    let user = req.user;
    fs.readdir(allProjectBuf, (err, projects) => {
      // get all exixting projects
      if (err) {
        console.log(err.message);
      } else {
        if (req.cookies.projectName) {
          // when a project is selected
          let projectBuf = Buffer.from(
            "./public/allProjects/" +
              req.cookies.userid +
              "/" +
              req.cookies.projectName
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
            "./public/allProjects/" +
              req.cookies.userid +
              "/" +
              req.cookies.projectName +
              "/datasets"
          );
          fs.readdir(dirBuf, (err, files) => {
            if (err) {
              console.log(err.message);
            } else {
              // res.cookie("trainfiles", files);
              var trainfiles = files;
              res.render("upload", {
                projects: projects,
                trainfiles: trainfiles,
                projectName: req.cookies.projectName,
                selectedDir: req.cookies.selectedDir,
                uname: user.user_name,
                imgs: req.cookies.imgs
              });
            }
          });
        } else {
          res.render("upload", {
            projects: projects,
            trainfiles: [],
            projectName: req.cookies.projectName,
            selectedDir: req.cookies.selectedDir,
            uname: user.user_name,
            imgs: req.cookies.imgs
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
  // projectName = req.body.projectName;
  res.cookie("projectName", req.body.projectName);
  res.cookie("epoch", -1);
  res.cookie("train_batch_size", -1);
  res.cookie("validation_batch_size", -1);
  res.cookie("test_batch_size", -1);
  res.cookie("selectedCategory", "");
  res.cookie("selectedDir", "");

  let user = req.user;
  let expTitle = req.body.projectName + "-testData";
  let now = new Date(new Date().toString().split("GMT")[0] + " UTC")
    .toISOString()
    .split(".")[0]
    .replace("T", "-");
  db.query(
    "INSERT IGNORE INTO experiments (users_id, exp_title, exp_birth_date, exp_type) VALUES (?, ?, ?, ?)",
    [user.user_id, expTitle, now, "T"],
    function(error, results, fields) {
      if (error) throw error;
      console.log("results.insertId (exp_id)", results.insertId);
    }
  );

  if (
    !fs.existsSync(
      "./public/allProjects/" +
        req.cookies.userid +
        "/" +
        req.body.projectName +
        "/datasets"
    )
  ) {
    fs.mkdirSync(
      "./public/allProjects/" +
        req.cookies.userid +
        "/" +
        req.body.projectName +
        "/datasets",
      {
        recursive: true
      }
    );
  }
  if (
    !fs.existsSync(
      "./public/allProjects/" +
        req.cookies.userid +
        "/" +
        req.body.projectName +
        "/testData"
    )
  ) {
    fs.mkdirSync(
      "./public/allProjects/" +
        req.cookies.userid +
        "/" +
        req.body.projectName +
        "/testData",
      {
        recursive: true
      }
    );
  }
  if (
    !fs.existsSync(
      "./public/allProjects/" +
        req.cookies.userid +
        "/" +
        req.body.projectName +
        "/models"
    )
  ) {
    fs.mkdirSync(
      "./public/allProjects/" +
        req.cookies.userid +
        "/" +
        req.body.projectName +
        "/models",
      {
        recursive: true
      }
    );
  }
  res.redirect("/upload");
});

// create categories in each project /datasets and /testData
router.post("/createDir", function(req, res) {
  console.log("post /createDir, ", "body:", req.body);
  category = req.body.category;

  if (
    !fs.existsSync(
      "./public/allProjects/" +
        req.cookies.userid +
        "/" +
        req.cookies.projectName +
        "/datasets/" +
        category
    )
  ) {
    fs.mkdirSync(
      "./public/allProjects/" +
        req.cookies.userid +
        "/" +
        req.cookies.projectName +
        "/datasets/" +
        category,
      {
        recursive: true
      }
    );
  }
  if (
    !fs.existsSync(
      "./public/allProjects/" +
        req.cookies.userid +
        "/" +
        req.cookies.projectName +
        "/testData/" +
        category
    )
  ) {
    fs.mkdirSync(
      "./public/allProjects/" +
        req.cookies.userid +
        "/" +
        req.cookies.projectName +
        "/testData/" +
        category,
      {
        recursive: true
      }
    );
  }
  res.redirect("/upload");
});

// select a category directory to upload
router.post("/selectDir", function(req, res) {
  res.cookie("selectedCategory", req.body.category);
  res.cookie(
    "selectedDir",
    "./public/allProjects/" +
      req.cookies.userid +
      "/" +
      req.cookies.projectName +
      "/datasets/" +
      req.body.category
  );
  res.cookie("selectTestDir", 0);

  console.log("__dirname: ", __dirname.split("routes")[0]);
  var selected_dir =
    __dirname.split("routes")[0] +
    "public/allProjects/" +
    req.cookies.userid +
    "/" +
    req.cookies.projectName +
    "/datasets/" +
    req.body.category;
  // let imgs = "";
  fs.readdir(selected_dir, (err, files) => {
    res.cookie("imgs", files);
    res.redirect("/upload");
  });
});

// same as /selectDir, but with /../testDate/selectedCategory/ as target folder
router.post("/selectTestDir", function(req, res) {
  res.cookie("selectedCategory", req.body.category);
  res.cookie(
    "selectedDir",
    "./public/allProjects/" +
      req.cookies.userid +
      "/" +
      req.cookies.projectName +
      "/testData/" +
      req.body.category
  );
  res.cookie("selectTestDir", 1);

  console.log("__dirname: ", __dirname.split("routes")[0]);
  var selected_dir =
    __dirname.split("routes")[0] +
    "public/allProjects/" +
    req.cookies.userid +
    "/" +
    req.cookies.projectName +
    "/testData/" +
    req.body.category;

  fs.readdir(selected_dir, (err, files) => {
    console.log("imgs", files);
    res.cookie("imgs", files);
    res.redirect("/upload");
  });
});

// select a project
router.post("/selectProject", function(req, res) {
  console.log("post /selectProject with body:", req.body);
  res.cookie("projectName", req.body.projectName);
  res.cookie("epoch", -1);
  res.cookie("train_batch_size", -1);
  res.cookie("validation_batch_size", -1);
  res.cookie("test_batch_size", -1);
  res.cookie("selectedCategory", "");
  res.cookie("selectedDir", "");
  res.cookie("imgs", "");
  res.redirect("/upload");
});

// pop up window
// router.get("/createFile", function(req, res) {
//   console.log("get /createFile,", "selectedDir:", selectedDir);
//   res.render("createFile", { selectedDir: selectedDir });
// });

// router.post("/createTestDir", function(req, res) {
//   console.log("post /createTestDir, ", "body:", req.body);
//   console.log("creating dir: ", "./public/allProjects/" + userid + "/" + projectName + "/testData");

//   if (!fs.existsSync("./public/allProjects/" + userid + "/" + projectName + "/testData")) {
//     fs.mkdirSync("./public/allProjects/" + userid + "/" + projectName + "/testData", {
//       recursive: true
//     });
//   }
//   hasTestDir = true;

//   let dirBuf = Buffer.from("./public/allProjects/" + userid + "/" + projectName + "/datasets");
//   fs.readdir(dirBuf, (err, files) => {
//     if (err) {
//       console.log(err.message);
//     } else {
//       // propagate all categories in datasets(train) to testData
//       files.forEach(function(file) {
//         if (
//           !fs.existsSync("./public/allProjects/" + userid + "/" + projectName + "/testData/" + file)
//         ) {
//           fs.mkdirSync("./public/allProjects/" + userid + "/" + projectName + "/testData/" + file, {
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

// Auth middleware
function authenticationMiddleware() {
  return (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect("/");
  };
}

module.exports.router = router;
