const db = require('../database/db');
let express = require('express');
let router = express.Router();

// @route   GET /test data summary
// @desc    Retrieve summary of all test experiments conducted by the user
// @access  Private

// Select DATE_FORMAT(e.exp_birth_date,"%Y/%m/%d %T")  as "Date", e.exp_title as "Experiment Name", m.model_fullname, m.cm,
// m.imgs01 as "Acutal Control Predicted Mutant", m.imgs10 as "Actual Mutant Predicted Control"
// from csc899.experiments e, csc899.models m 
// where e.users_id=9 and e.exp_type='T' and m.exp_id = e.exp_id;

router.get('/', function (req, res, next) {
    if (req.isAuthenticated()) {
        let user = req.user;
    db.query('SELECT e.exp_id, DATE_FORMAT(e.exp_birth_date,"%Y/%m/%d %T")  as "Date", e.exp_title, m.test_accuracy,  m.model_fullname, m.cm, m.imgs01, '
            + ' m.imgs10 '
            + 'from csc899.experiments e, csc899.models m  '
            + 'WHERE m.exp_id = e.exp_id AND e.users_id = ' + user.user_id + ' '
            + ';', function (error, results, fields) {
            if (error) throw error;
        console.log(this.sql);
            res.render('testSummary', {uname: user.user_name, testSummary: results});
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