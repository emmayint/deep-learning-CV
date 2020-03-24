const db = require("../database/db");
let express = require("express");
let router = express.Router();
let multer = require("multer");
let path = require("path");
let res = require("express");
let ImageUrl = "http://localhost:5001/uploads/";

// @route   GET /:id
// @desc    Get Test Data Images by experiment id
// @access  Private
router.get("/:id/:model_id", function (req, res, next) {
  if (req.isAuthenticated()) {
    let user = req.user;
    let id = req.params.id;
    let model_id = req.params.model_id;
    console.log(id);
    // const labelNameewrew = req.params.prevdate;
    // console.log("Datepicke1111: " + labelNameewrew);

    console.log(req.params);

    db.query(
      "SELECT distinct m.user_id, e.exp_id, e.img_dir, e.label FROM experiment_images e, models m  WHERE e.exp_type='T' AND e.exp_id=m.exp_id AND e.user_id = " + user.user_id +
      " AND e.exp_id = " +
      id +
      ";",
      function (error, results, fields) {
        console.log("*****MainQuery********", this.sql);
        if (error) throw error;
        db.query(
          "SELECT user_id,imgs01,imgs10,project_name FROM models WHERE user_id = " + user.user_id +
          " AND exp_id = " +
          id +
          " AND id = " +
          model_id +
          ";",
          function (error, results1, fields) {
            console.log("Results1--------", this.sql);
            if (error) throw error;

            res.render("testSummaryDetail", {
              uname: user.user_name,
              modeldata: results1,
              data: results,
              id: id,
              u_id: user.user_id
            });
          }
        );
      }
    );
  } else {
    res.redirect("/");
  }
});

// Add mideleware to the route
router.get("/:id", authenticationMiddleware(), function (req, res) {
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