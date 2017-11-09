const express = require('express');
const router = express.Router();
const User = require('../models/user');
const validator = require('validator');
const { check, validationResult } = require('express-validator/check');


router.get('/',function(req, res){
    if(req.user) res.redirect('/');
    else
        res.render('signup');
});
router.post('/',[
    check('email').isEmail().withMessage('Email address is invalid').trim(),
    check('password').isLength({min:8}).withMessage('Password must be at least 8 characters.')
],function(req, res){
    if(req.user) res.redirect('/');

    const errors = validationResult(req);
    if (!errors.isEmpty()){
        res.render('signup', {validationErrors:errors.array()});
    }
    else{
        let user = new User();
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