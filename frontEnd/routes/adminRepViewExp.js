const db = require('../database/db');
let express = require('express');
let router = express.Router();

// @route   GET /summary
// @desc    Retrieve summary of all experiments conducted by the user
// @access  Private
router.get("/:id/:create_at", function(req, res, next) {
    if (req.isAuthenticated()) {
      let user = req.user;
      let id = req.params.id;
      let create_at = req.params.create_at;

    db.query('SELECT distinct p.exp_type as prediction, DATE_FORMAT(e.exp_birth_date,"%m/%d/%Y") AS exp_date, e.*, ei.* FROM experiments e, experiment_images ei, prediction_type p' +
    ' WHERE e.exp_id= ' +
    id +
    ' AND ei.exp_id= ' +
    id +
    " AND p.exp_img_id = ei.id and DATE_FORMAT(p.created_at,'%Y-%m-%d %T') = '" + 
        create_at + 
        "' AND p.exp_id = ei.exp_id AND p.exp_id = e.exp_id;", function(error, results, fields) {
        console.log(this.sql);
        if (error) throw error;
        res.render("adminReportViewExperiment", {
          uname: user.user_name,
          data: results,
          id: id
        });
      }
    );
    } else {
        res.redirect('/');
    }
});

// Add mideleware to the route
router.get('/', authenticationMiddleware(), function (req, res) {
    res.render('summary');
});

// Auth middleware
function authenticationMiddleware() {
    return (req, res, next) => {
        if (req.isAuthenticated()) return next();
        res.redirect('/')
    }
}

module.exports = router;