const db = require('../database/db');
let express = require('express');
let router = express.Router();

// @route   GET /home
// @desc    Retrieve all the experiment created by the user
// @access  Private
// router.get('/gallary', function (req, res, next) {
//     if (req.isAuthenticated()) {
//         let user = req.user;

// db.query('SELECT experiment_images.exp_id, experiment_images.user_id, DATE_FORMAT(experiments.exp_birth_date,"%m/%d/%Y") AS exp_birth_date, experiments.exp_title, MIN(experiment_images.exp_images) AS exp_images '
//             + 'FROM experiments, experiment_images '
//             + 'WHERE experiments.users_id = experiment_images.user_id AND experiments.exp_id = experiment_images.exp_id AND experiments.users_id = ' + user.user_id + ' '
//             + 'GROUP BY experiment_images.exp_id, experiments.exp_title ORDER BY exp_id desc;', function (error, results, fields) {
//             if (error) throw error;
//         console.log('user authenticated');
//         console.log(this.sql);
//             res.render('home', {uname: user.user_name, data: results});
//         });
//     } else {
//         res.redirect('/');
//     }
// });

router.get('/', function (req, res, next) {
    if (req.isAuthenticated()) {
        let user = req.user;
//         console.log("M HERE--->", user.user_id);
//     db.query('SELECT p.exp_id, DATE_FORMAT(p.created_at,"%m/%d/%Y %T") AS prediction_date, e.exp_title, "VGG-16" as model_name, '
//             + 'COUNT(p.exp_img_id) as total_images, SUM(case when p.exp_type= "CONTROL" then 1 else 0 end) as control_count, '
//             + 'SUM(case when p.exp_type= "MUTANT" then 1 else 0 end) as mutant_count ' 
//             + 'FROM prediction_type p, experiments e '
//             + 'WHERE p.exp_id = e.exp_id AND e.users_id = ' + user.user_id + ' '
//             + 'GROUP BY p.exp_id,p.created_at, e.exp_title ORDER BY p.created_at desc;', function (error, results, fields) {
//             if (error) throw error;
//         console.log('Inside Home/Summary GET Request');
//         console.log(this.sql);
            res.render('home', {uname: user.user_name});
        // });
    } else {
        res.redirect('/');
    }
});

// Add mideleware to the route
router.get('/', authenticationMiddleware(), function (req, res) {
    res.render('home');
});

// Auth middleware
function authenticationMiddleware() {
    return (req, res, next) => {
        if (req.isAuthenticated()) return next();
        res.redirect('/')
    }
}

module.exports = router;