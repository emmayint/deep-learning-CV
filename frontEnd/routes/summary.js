const db = require('../database/db');
let express = require('express');
let router = express.Router();

// @route   GET /summary
// @desc    Retrieve summary of all experiments conducted by the user
// @access  Private
router.get('/', function (req, res, next) {
    if (req.isAuthenticated()) {
        let user = req.user;
        console.log("M HERE--->", user.user_id);
    db.query('SELECT p.exp_id, DATE_FORMAT(p.created_at,"%Y/%m/%d %T") AS prediction_date, e.exp_title, "VGG-16" as model_name, '
            + 'COUNT(p.exp_img_id) as total_images, SUM(case when p.exp_type= "CONTROL" then 1 else 0 end) as control_count, '
            + 'SUM(case when p.exp_type= "MUTANT" then 1 else 0 end) as mutant_count ' 
            + 'FROM prediction_type p, experiments e '
            + 'WHERE p.exp_id = e.exp_id AND e.users_id = ' + user.user_id + ' '
            + 'GROUP BY p.exp_id,p.created_at, e.exp_title ORDER BY p.created_at desc;', function (error, results, fields) {
            if (error) throw error;
        console.log(this.sql);
            res.render('summary', {uname: user.user_name, dataSummary: results});
        });
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