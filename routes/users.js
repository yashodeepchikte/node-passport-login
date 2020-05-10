const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs")
const passport = require("passport");
// User database model
const User = require("../models/Users")

// Login page
router.get("/login", (req, res) => {
    res.render("login");
});

// Register page
router.get("/register", (req, res) => {
    res.render("register");
});


// Register handelling
router.post("/register", (req, res) => {

    const { name, email, password, password2 } = req.body;
    let errors = [];
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }
    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }
    if (password.length < 3) {
        errors.push({ msg: 'Password must be at least 6 characters' });
      }


    if (errors.length > 0){
        res.render('register', {errors, name, email, password, password2})
    }else{
        // check if the email is already registered
        User.findOne( {email:email}).then(user => {
            if (user){
                errors.push({ msg: 'Email already exists' });
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                  });
            }else{
                const newUser = new User({name:name, email:email, password:password});
                
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save().then( user => {
                        console.log("successfully registered");
                        req.flash(
                            'success_msg',
                            'You are now registered and can log in'
                          );
                        res.redirect("/users/login");
                        })
                        .catch(err => console.log(err));

                    });
                        
                });
            }
            })        
    }
})

// Login handelling
router.post("/login", (req, res, next) => {
    passport.authenticate('local', {
        successRedirect:"/dashboard",
        failureRedirect: '/users/login',
        failureFlash:true
    })(req, res, next);
});


// Logout handelling
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You have been logged out');
    res.redirect('/users/login');
  });
module.exports = router;