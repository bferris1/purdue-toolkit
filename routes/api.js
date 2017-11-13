const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Watch = require('../models/watch');
const jwt = require('jsonwebtoken');
const config = require('../config.json');




router.post('/auth',function (req, res) {
	User.findOne({email:req.body.email}).select('name email password').exec(function (err, user) {
		if(err||!user)
			res.json({success:false,message:'Error finding user'});
		else if(req.body.password){
			let validPassword = user.comparePassword(req.body.password);
			if(!validPassword)
				res.json({success:false, message:'Invalid Password'});
			else{
				let token = jwt.sign({
					email: user.email,
					id: user._id
				},
				config.jwt.secret,
				{
					//expiresInMinutes: 10080
				});

				res.json({
					success: true,
					token: token
				});
			}
		}
		else{
			res.json({success:false, message:'An email and password are required.'});
		}
	});
});

//middleware for authenticating requests to the api
router.use(function (req, res, next) {

	if(req.user){
		next();
	}else {
		let token = req.body.token || req.params.token ||req.headers['x-access-token'];

		if(token){
			jwt.verify(token,config.jwt.secret,function(err, decoded){
				if(err){
					return res.status(403).send({success:false,message:'Failed to authenticate token'});
				}else{
					req.decoded = decoded;
					next();
				}
			});
		}else{
			//no token provided
			return res.status(403).send({
				success:false,
				message: 'No token provided'
			});
		}
	}

});
//allow user info from active session to be used
router.use(function (req, res, next) {
	if(req.user && !req.decoded)
		req.decoded = req.user;
	next();
});

router.param('watchID', function (req, res, next, id) {
	console.log(req.decoded);
	Watch.findOne({_id:id}, function (err, watch) {
		if(err||!watch)
			res.status(500).json({success:false,message:'Error finding watch with this id.'});
		else if(watch.email !== req.decoded.email && !(watch.user && req.decoded._id.equals(watch.user)))
			res.status(401).json({success:false, message:'You are not authorised to access this watch.'});
		else
			next();
	});
});


router.get('/', function (req, res) {
	res.json({message:'Welcome to the api!'});
});

router.get('/watches',function (req, res) {
	Watch.find({$or: [ { email: req.decoded.email }, { user:req.decoded.id } ]}).sort('-createdAt').exec(
		function (err, watches) {
			if(err)
				res.json({success:false,message:err.message});
			else
				res.json(watches);

		});
});

//todo:post route for adding a watch

router.get('/watches/:watchID',function (req, res) {
	Watch.findOne({_id:req.params.watchID},function (err, watch) {
		if(err)
			res.json({success:false,message:err.message});
		else
			res.json(watch);
	});
});

router.delete('/watches/:watchID',function (req, res) {

	Watch.remove({_id:req.params.watchID},function (err) {
		if(err)
			res.json({success:false,message:err.message});
		else
			res.json({success:true});
	});
});


module.exports = router;