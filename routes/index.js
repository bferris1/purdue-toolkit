const express = require('express');
const router = express.Router();
const Watch = require('../models/watch');
const account = require('./account');
const resetRoutes = require ('./reset');
const forgotRoutes = require('./forgot');
const signupRoutes = require('./signup');
const passport = require('passport');
const checker = require('../util/checker');
const format = require('../util/stringFormatter');
const { check, validationResult } = require('express-validator/check');

//always include the user object when rendering views
router.use(function(req, res, next){
	res.locals.user = req.user;
	next();
});


/* GET home page. */
router.get('/', function(req, res) {
	res.render('index');
});

//post to home page to create a new watch
//todo: better string formatting
router.post('/',[
	check('email').exists().isEmail().withMessage('Email address is not valid.').trim(),
	check('crn').isInt().withMessage('CRN is invalid'),
	check('term').isInt().withMessage('Term is not valid')
],function (req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()){
		res.render('index', {validationErrors:errors.array()});
	}
	else {
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
							watch.courseTitle = section.courseTitle;
							watch.courseNumber = section.courseNumber;
							watch.sectionNumber = section.sectionNumber;
							if(req.user)
								watch.user = req.user.id;
							watch.save(function (err, watch) {
								if(err) res.send(err);
								else{
									req.flash('success',format.watchSuccess(watch));
									res.render('index');
								}
							});
						}else{
							req.flash('info','It looks like you\'ve already submitted a request for this section.');
							res.render('index');
						}
					});

				}
			}
		});
	}
});

router.use('/account', account);

//route for the watches page

router.get('/watches', function (req, res) {
	//check if user is logged in
	if(req.user){
		res.render('watches');
	}else{
		//redirect to login page if not logged in
		res.redirect('/login');
	}
});

router.get('/login',function(req, res){
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
