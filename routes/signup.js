const express = require('express');
const router = express.Router();
const User = require('../models/user');
const validator = require('validator');


router.get('/',function(req, res){
    if(req.user) res.redirect('/');
    else
        res.render('signup');
});
router.post('/',function(req, res){
    if(req.user) res.redirect('/');
    req.sanitizeBody('email').trim();
    req.checkBody('email', 'Email address is required').notEmpty();
    req.checkBody('email', 'Email address is invalid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password', 'Password must be at least 8 characters.').len(8, undefined);
    if(req.validationErrors()){
        res.render('signup',{validationErrors:req.validationErrors()});
    }else{
        var user = new User();
        user.email = validator.trim(req.body.email);
        user.password = req.body.password;

        user.save(function (err, user){
            if (err) {
                if (err.code == 11000){
                    req.flash('error','A user with that email address already exists.');
                    res.render('signup');
                }
                else{
                    req.flash('error','An error occurred while saving to the database.');
                    res.render('signup');
                }
            } else{
                req.login(user,function(err){
                    if(err) return next(err);
                    else return res.redirect('/account')
                })
            }

        });
    }



});



module.exports = router;