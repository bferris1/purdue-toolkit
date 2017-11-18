const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

router.get('/', function (req, res){
	if (req.user) res.render('account');
	else res.redirect('/login');
});

router.post('/', [
	check('email').optional({checkFalsy: true}).isEmail().withMessage('Email address is invalid.').trim(),
	check('password').optional({checkFalsy: true}).isLength({min: 8}).withMessage('Password must be at least 8 characters.')
], function (req, res) {
	//todo: check input stuff
	const errors = validationResult(req);
	if (!errors.isEmpty()){
		return res.render('account', {validationErrors: errors.array()});
	} else {
		if (req.user){
			let user = req.user;
			console.log('Email:'+req.body.email);
			if (req.body.firstName)
				user.firstName = req.body.firstName;
			if (req.body.lastName)
				user.lastName = req.body.lastName;
			if (req.body.email)
				user.email = req.body.email;
			if (req.body.password)
				user.password = req.body.password;
			if (req.body.pushoverKey){
				user.pushoverKey = req.body.pushoverKey;
			} else {
				user.pushoverKey = null;
			}
			user.save(function (err) {
				if (!err){
					req.flash('success', 'Account updated.');
					res.render('account');
				} else {
					req.flash('error', 'An error occurred while saving your information.');
					res.render('account');
				}
			});
		} else {
			res.redirect('/login');
		}
	}


});


module.exports = router;