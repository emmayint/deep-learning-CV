let express = require('express');
let router = express.Router();
let db = require('../database/db');
let bcrypt = require('bcrypt');
const saltRounds = 10;
let expressValidator = require('express-validator');
let passport = require('passport');
let session = require('express-session');
​
// @route   GET /signUp
// @desc    Render Sign Up Form
// @access  Public
router.get('/', function (req, res, next) {
    res.render('signUp');
// res.render('signIn.ejs');
​
});
​
// @route   POST /signUp
// @desc    Create new user, after Sign Up Form submission
// @access  Public
router.post('/', function (req, res, next) {
    username = req.body.username;
    email = req.body.email;
    password = req.body.password;
    console.log("USERNAME" +username)
    console.log("email", email)
    console.log("password" +password)
​
    db.query("SELECT * from users WHERE username = ?", [username], function(
      err,
      results,
      fields
    ){
        if (err) {
        console.log("ERROR");
      }
      // If username does not exist in db
      if (results.length === 0) {
    bcrypt.hash(password, saltRounds, function (err, hash) {
        db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hash], function (error, results, fields) {
                if (error) throw error;
​
                db.query('SELECT LAST_INSERT_ID() AS user_id', function (error, results, fields) {
                    if (error) throw error;
​
                    // get userId of logged in user
                    const user_id = results[0];
​
                    console.log('UserId' + user_id);
                    req.logIn(user_id, function (err) {
                        // if success
                        setTimeout(function(){ 
                            res.redirect('/'); 
                        }, 3000);
                    });
                });
                console.log("result:" + JSON.stringify(results));
            })
    });
}else{
    // res.redirect('/');
    res.render('signIn.ejs',{error: "User Already Exists!"})
    }
});
});
​
passport.serializeUser(function (user_id, done) {
    done(null, user_id);
});
​
passport.deserializeUser(function (user_id, done) {
    done(null, user_id);
});
​
module.exports = router;