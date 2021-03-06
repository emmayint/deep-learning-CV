const db = require('../database/db');
let express = require('express');
let router = express.Router();

// @route   GET /home
// @desc    Retrieve all the experiment created by the user
// @access  Private
router.get('/', function (req, res, next) {
    if (req.isAuthenticated()) {
        let user = req.user;

db.query('SELECT experiment_images.exp_id, experiment_images.user_id, DATE_FORMAT(experiments.exp_birth_date,"%m/%d/%Y") AS exp_birth_date, experiments.exp_title, MIN(experiment_images.exp_images) AS exp_images '
            + 'FROM experiments, experiment_images '
            + 'WHERE experiments.exp_type is NULL AND experiments.users_id = experiment_images.user_id AND experiments.exp_id = experiment_images.exp_id AND experiments.users_id = ' + user.user_id + ' '
            + 'GROUP BY experiment_images.exp_id, experiments.exp_title ORDER BY exp_id desc;', function (error, results, fields) {
            if (error) throw error;
        console.log('user authenticated');
        console.log(this.sql);
            res.render('gallary', {uname: user.user_name, data: results});
        });
    } else {
        res.redirect('/');
    }
});

// Add mideleware to the route
router.get('/', authenticationMiddleware(), function (req, res) {
    res.render('gallary');
});

// Auth middleware
function authenticationMiddleware() {
    return (req, res, next) => {
        if (req.isAuthenticated()) return next();
        res.redirect('/')
    }
}

module.exports = router;