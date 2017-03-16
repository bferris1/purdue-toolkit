'use strict';
var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Watch = require('../models/watch');
var passport = require('passport');
var crypto = require('crypto');
var validator = require('validator');
var config = require('../config.json');
var sendgrid  = require('sendgrid')(config.sendgrid.key);
var checker = require('../checker');
var applicationURL = process.env.URL || 'http://localhost:3000';

//always include the user object when rendering views
router.use(function(req, res, next){
    res.locals.user = req.user;
    next();
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

//post to home page to create a new watch
//todo: better string formatting
router.post('/',function (req, res) {
    req.check('email', 'Email address is required.').notEmpty();
    req.check('email', 'Email address is not valid.').isEmail();
    req.check('crn', 'CRN is required.').notEmpty();
    req.check('crn', 'CRN must be an integer.').isNumeric().isInt();
    req.check('term', 'Term is invalid.').notEmpty().isNumeric();

    if(req.validationErrors()){
        res.render('index',{validationErrors:req.validationErrors()});
    }else {
        //verify CRN and make sure there is no space available
        console.log(req.body.crn);
        console.log(req.body.term);
        console.log(req.body.email);
        checker.getSection(req.body.term,req.body.crn,function (err, section) {
            if(err) {
                req.flash('error',err.message);
                res.render('index');
            }
            else{
                if(section.availableSeats>0){
                    req.flash('error','It looks like there are still '+section.availableSeats+' available seats in this section!');
                    res.render('index');
                }else{
                    //check for active duplicates
                    Watch.findOne({email:req.body.email,crn:req.body.crn,term:req.body.term,isActive:true},function (err, foundWatch) {
                        if(!foundWatch){
                            var watch = new Watch();
                            watch.email = req.body.email;
                            watch.crn = req.body.crn;
                            watch.term = req.body.term;
                            watch.title = section.title;
                            var titleParts  = section.title.split(' - ');
                            watch.courseTitle = titleParts[0].trim();
                            watch.courseNumber = titleParts[2].trim();
                            watch.sectionNumber = titleParts[3].trim();
                            if(req.user)
                                watch.user = req.user.id;
                            watch.save(function (err, watch) {
                                if(err) res.send(err);
                                else{
                                    req.flash('success','You will be notified when there is space available in <strong>'+watch.title+'</strong>');
                                    res.render('index');
                                }
                            })
                        }else{
                            req.flash('info','It looks like you\'ve already submitted a request for this section.');
                            res.render('index');
                        }
                    });

                }
            }
        })
    }
});

router.get('/account',function(req, res){
    if(req.user) res.render('account');
    else res.redirect('/login');
});

router.post('/account', function (req, res) {
    //todo: check input stuff
    if(req.body.email)
        req.checkBody('email','Email is not valid').optional().isEmail().notEmpty();
    if(req.body.password)
        req.checkBody('password', 'Password must be at least 8 characters.').optional().len(8, undefined);

    if(req.validationErrors()){
        res.render('account',{validationErrors:req.validationErrors()});
    }else{
        if(req.user){
            let user = req.user;
            console.log('Email:'+req.body.email);
            if(req.body.firstName)
                user.firstName = req.body.firstName;
            if(req.body.lastName)
                user.lastName = req.body.lastName;
            if(req.body.email)
                user.email = req.body.email;
            if(req.body.password)
                user.password = req.body.password;
            if(req.body.pushoverKey){
                user.pushoverKey = req.body.pushoverKey;
            }else {
                user.pushoverKey = null;
            }
            user.save(function (err, user) {
                if(!err){
                    req.flash('success','Account updated.');
                    res.render('account');
                }else{
                    req.flash('error','An error occurred while saving your information.');
                    res.render('account');
                }
            })
        }else{
            res.redirect('/login');
        }
    }


});

//route for the watches page

router.get('/watches', function (req, res) {
    //todo: remove this, it uses the api now
    //check if user is logged in
    if(req.user){
        //find all the user's watches
        Watch.find({
            $or: [ { email: req.user.email }, { user:req.user.id } ]
        },function (err, watches) {
            //send an error message if there is an error getting the watches
            if(err){
                req.flash('error',err.message);
            }else{
                //otherwise, render the template, passing it the array of watches
                res.render('watches',{watches:watches})
            }
        })
    }else{
        //redirect to login page if not logged in
        res.redirect('/login');
    }
});

router.get('/login',function(req, res, next){
    if(req.user) res.redirect('/');
    else
    res.render('login');
});

router.post('/login',
    passport.authenticate('local',{successRedirect:'/',failureRedirect:'/login', failureFlash:true})
);

router.get('/logout',function(req, res){
    req.logout();
    res.redirect('/');
});

router.get('/forgot',function(req, res){
    if(req.user) res.redirect('/');
    res.render('forgot');
});

//route for requesting a password reset
router.post('/forgot',function (req, res) {
    //redirect if the user is not logged in
    if(req.user) res.redirect('/');
    else
    if(req.body.email&&req.body.email!=''){
        console.log(req.body.email);
        User.findOne({email:req.body.email},function (err, user) {
            if(err||!user) {
                req.flash('error','Email address not found');
                res.render('forgot');
            }
            else{
                crypto.randomBytes(20, function (err, buff) {
                    // store the buffer as the user's reset key
                    user.resetToken = buff.toString('hex');
                    user.resetExpiration = Date.now()+3600000; //expires in one hour
                    user.save(function (err, user) {
                        if(err)
                            res.send('error');
                        else{
                            //send a reset email to the user
                            var email = new sendgrid.Email({
                                to:user.email,
                                from:'notifications@putoolkit.xyz',
                                subject:'Class Watcher Password Reset',
                                html:'this will be replaced by the template',
                                text:applicationURL + '/reset/' + buff.toString('hex')
                            });
                            // add filter settings one at a time
                            email.addFilter('templates', 'enable', 1);
                            email.addFilter('templates', 'template_id', 'ad392fc9-55b7-4fef-9bae-3288156aec58');
                            email.addSubstitution('-resetURL-',applicationURL + '/reset/'+buff.toString('hex'));
                            sendgrid.send(email,function (err, json) {
                                if(err) {
                                    console.log(err);
                                    res.send('error');
                                }
                                else {
                                    req.flash('info','A email has been sent with further instructions.');
                                    res.render('forgot');
                                }
                            })

                        }

                    })
                })
            }
        })
    }else{
        req.flash('error', 'Email address is required.');
        res.render('forgot');
    }

});

//routes for resetting password
router.get('/reset/:token', function (req, res) {
    if(req.params.token&&req.params.token!=''){
        User.findOne({resetToken:req.params.token, resetExpiration:{$gt:Date.now()}}, function (err, user) {
            if(!user){
                req.flash('error', 'Password reset token is invalid or has expired.');
                res.redirect('/forgot')
            }
            else{
                res.render('reset')
            }
        })
    }else{res.redirect('/forgot');}
});

router.post('/reset/:token', function(req, res){
    //find the user if the reset token has not expired
    User.findOne({resetToken:req.params.token, resetExpiration:{$gt:Date.now()}}, function(err, user){
        if(!user){
            //error message handling
            req.flash('error', 'Password reset token is invalid or has expired.');
            res.redirect('/forgot');
        }else{
            req.checkBody('password', 'Password is required').notEmpty();
            req.checkBody('password', 'Password must be at least 8 characters.').len(8, undefined);
            if(req.validationErrors()){
                res.render('reset',{validationErrors:req.validationErrors()});
            }else{
                user.password = req.body.password;
                user.resetToken = undefined;
                user.resetExpiration = undefined;
                user.save(function (err, user) {
                    req.login(user, function (err) {
                        if(err){
                            req.flash('error','Unable to log in.');
                            res.redirect('/forgot');
                        }
                        else {
                            req.flash('success', 'Your password has been updated.');
                            res.redirect('/account');
                        }
                    })
                })
            }
        }
    })
});

router.get('/signup',function(req, res){
    if(req.user) res.redirect('/');
    else
    res.render('signup');
});
router.post('/signup',function(req, res){
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
