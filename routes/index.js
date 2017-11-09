const express = require('express');
const router = express.Router();
const Watch = require('../models/watch');
const account = require('./account');
const resetRoutes = require ('./reset');
const forgotRoutes = require('./forgot');
const signupRoutes = require('./signup');
const passport = require('passport');
const checker = require('../checker');
const applicationURL = process.env.URL || 'http://localhost:3000';

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
                    let seatsMessage;
                    if (section.availableSeats == 1)
                        seatsMessage = 'It looks like there is still 1 available seat in this section!';
                    else
                        seatsMessage = `It looks like there are still ${section.availableSeats} seats available in this section`;
                    req.flash('error',seatsMessage);
                    res.render('index');
                }else{
                    //check for active duplicates
                    Watch.findOne({email:req.body.email,crn:req.body.crn,term:req.body.term,isActive:true},function (err, foundWatch) {
                        if(!foundWatch){
                            let watch = new Watch();
                            watch.email = req.body.email;
                            watch.crn = req.body.crn;
                            watch.term = req.body.term;
                            watch.title = section.title;
                            let titleParts  = section.title.split(' - ');
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

router.use('/account', account);

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

router.use('/forgot', forgotRoutes);

router.use('/reset', resetRoutes);

router.use('/signup', signupRoutes);

module.exports = router;
