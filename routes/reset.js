const express = require('express');
const router = express.Router();
const User = require('../models/user');


//routes for resetting password
router.get('/reset/:token', function (req, res) {
	if(req.params.token&&req.params.token!=''){
		User.findOne({resetToken:req.params.token, resetExpiration:{$gt:Date.now()}}, function (err, user) {
			if(!user){
				req.flash('error', 'Password reset token is invalid or has expired.');
				res.redirect('/forgot');
			}
			else{
				res.render('reset');
			}
		});
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
					});
				});
			}
		}
	});
});//routes for resetting password
router.get('/:token', function (req, res) {
	if(req.params.token&&req.params.token!=''){
		User.findOne({resetToken:req.params.token, resetExpiration:{$gt:Date.now()}}, function (err, user) {
			if(!user){
				req.flash('error', 'Password reset token is invalid or has expired.');
				res.redirect('/forgot');
			}
			else{
				res.render('reset');
			}
		});
	}else{res.redirect('/forgot');}
});

router.post('/:token', function(req, res){
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
					});
				});
			}
		}
	});
});


module.exports = router;