const db = require('../database/db');
let express = require('express');
let router = express.Router();

// @route   GET /summary
// @desc    Retrieve summary of all experiments conducted by the user
// @access  Private
router.get('/', function (req, res, next) {
    if (req.isAuthenticated() && req.user.user_name === 'admin') {
        let user = req.user;
        db.query('SELECT e.exp_id, e.exp_title, u.username, DATE_FORMAT(ei.created_at,"%Y/%m/%d %T") AS Date, count(ei.exp_images)  as total, ' +
            'SUM(case when p.exp_type= "CONTROL" then 1 else 0 end) as control, ' +
            'SUM(case when p.exp_type= "MUTANT" then 1 else 0 end) as mutant, p.model_name ' +
            'from csc899.experiments e, csc899.users u, csc899.experiment_images ei, csc899.prediction_type p ' +
            'WHERE e.users_id = u.id and e.exp_type is NULL and e.exp_id = ei.exp_id and u.id=ei.user_id ' +
            'and p.exp_id = e.exp_id and p.exp_id = ei.exp_id and p.exp_img_id = ei.id ' +
            'group by e.exp_id, e.exp_title, u.username, date, p.created_at, p.model_name ' +
            'ORDER BY Date desc;',
            function (error, results, fields) {
                if (error) throw error;
                console.log(this.sql);
                res.render('adminReport', {
                    uname: user.user_name,
                    data: results
                });
            });
    } else {
        console.log("Username---------", req.user);
        res.redirect('/default');
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