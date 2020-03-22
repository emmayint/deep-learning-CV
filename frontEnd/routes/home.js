const db = require('../database/db');
let express = require('express');
let router = express.Router();

router.get('/', function (req, res, next) {
    if (req.isAuthenticated()) {
        let user = req.user;
            res.render('home', {uname: user.user_name});
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