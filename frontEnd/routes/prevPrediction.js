const db = require("../database/db");
let express = require("express");
let router = express.Router();
let multer = require("multer");
let path = require("path");
let res = require("express");
let ImageUrl = "http://localhost:5001/uploads/";

// Setting up upload function using multer
let upload = multer({
  dest: "./public/uploads",
  storage: multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, "./public/uploads");
    },
    filename: (req, file, cb) => {
      console.log(file.originalname);
      let ext = path.extname(file.originalname);
      // cb(null, Date.now().toString() + ".jpg");
      cb(null, file.originalname);
    }
  })
});

// apply filter by date
// router.post("/:id/filter", function(req, res, next) {
//   let user = req.user;
//   let id = req.params.id;
//   const bodydata = req.body;
//   const paramsdata = req.params;
//   console.log("user_id: " + user.user_id);
//   let prevdate = req.body.prevdate;
//   var prevdateonly = "'" + prevdate + "'";

//   db.query(
//     "SELECT * FROM prediction_type WHERE exp_id = " +
//       id +
//       " AND DATE(created_at) = " +
//       prevdateonly +
//       ";",
//     function(error, results, fields) {
//       if (error) throw error;

//       res.render("filterPrediction", {
//         uname: user.user_name,
//         data: results,
//         id: id
//       });
//     }
//   );
// });

// verify predictions by user

router.post("/:id", function(req, res, next) {
  let user = req.user;
  let exp_id = req.params.id;
  let bodyObject = req.body;
  let bodyLength = Object.keys(bodyObject).length;

  var imageIDval = [];
  var isCheckedval = [];
  Object.keys(bodyObject).forEach(function eachKey(key) {
    if (key.startsWith("imageID")) {
      imageIDval.push(bodyObject[key]);
    } else {
      isCheckedval.push(bodyObject[key]);
    }
  });

  for (let i = 0; i < bodyLength / 2; i++) {
    if(isCheckedval[i] !== 'Not-Validated'){
    db.query(
      'UPDATE prediction_type SET user_validate ="' +
        isCheckedval[i] +
        '" ,exp_validate = 1 WHERE exp_img_id = ' +
        imageIDval[i] +
        " AND exp_id = " +
        exp_id +
        " AND user_validate is NULL;",

      function(error, results, fields) {
        console.log("PrevPrediction QUERY---", this.sql);
        if (error) throw error;
      }
    );
  }
  }
  res.redirect("/Prevprediction/" + exp_id + "");
});

// @route   GET /:id
// @desc    Get previous prediction of the selected images by experiment id
// @access  Private
router.get("/:id", function(req, res, next) {
  if (req.isAuthenticated()) {
    let user = req.user;
    let id = req.params.id;
    console.log(id);
    // const labelNameewrew = req.params.prevdate;
    // console.log("Datepicke1111: " + labelNameewrew);

    console.log(req.params);

    db.query(
      "SELECT id, exp_id, exp_img_id, img, exp_type, DATE_FORMAT(created_at,'%m/%d/%Y %T') AS create_at, update_at, exp_validate, user_validate, pred_percentage FROM prediction_type WHERE exp_id = " +
        id +
        " order by created_at desc;",
      function(error, results, fields) {
        console.log(this.sql);
        if (error) throw error;

        res.render("prevprediction", {
          uname: user.user_name,
          data: results,
          id: id
        });
      }
    );
  } else {
    res.redirect("/");
  }
});


// @route   GET /:id
// @desc    Get previous prediction of the selected images from Summary page
// @access  Private
router.get("/:id/:create_at/:is_validated", function(req, res, next) {
  if (req.isAuthenticated()) {
    let user = req.user;
    let create_at = req.params.create_at;

    let is_validated = req.params.is_validated;
    let id = req.params.id;
    console.log(id);
    // const labelNameewrew = req.params.prevdate;
    // console.log("Datepicke1111: " + labelNameewrew);

    console.log(req.params);

    db.query(
      "SELECT id, exp_id, exp_img_id, img, exp_type, DATE_FORMAT(created_at,'%m/%d/%Y %T') AS create_at, update_at, exp_validate, user_validate, pred_percentage FROM prediction_type WHERE exp_id = " +
        id +
        " and DATE_FORMAT(created_at,'%Y-%m-%d %T') = '" + 
        create_at + 
        "' order by created_at desc;",
      function(error, results, fields) {
        console.log(this.sql);
        if (error) throw error;

        res.render("prevprediction", {
          uname: user.user_name,
          data: results,
          id: id,
          is_validated: is_validated
        });
      }
    );
  } else {
    res.redirect("/");
  }
});




// Add mideleware to the route
router.get("/:id", authenticationMiddleware(), function(req, res) {
  res.render("prevprediction");
});

// Auth middleware
function authenticationMiddleware() {
  return (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect("/");
  };
}

module.exports = router;
