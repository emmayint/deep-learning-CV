const db = require('../database/db');
let express = require('express');
let router = express.Router();

// @route   GET /test data summary
// @desc    Retrieve summary of all test experiments conducted by the user
// @access  Private


router.get('/', function (req, res, next) {
    if (req.isAuthenticated()) {
        let user = req.user;
        db.query('SELECT m.id, e.exp_id, DATE_FORMAT(m.timestamp,"%Y/%m/%d %T")  as "Date", e.exp_title, m.test_accuracy,  m.model_fullname, m.cm, m.imgs01, ' +
            ' m.imgs10 ' +
            'from experiments e, Models m  ' +
            'WHERE m.exp_id = e.exp_id AND e.users_id = ' + user.user_id + ' ' +
            'order by Date desc;',
            function (error, results, fields) {
                if (error) throw error;
                console.log(this.sql);
                res.render('testSummary', {
                    uname: user.user_name,
                    testSummary: results
                });
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