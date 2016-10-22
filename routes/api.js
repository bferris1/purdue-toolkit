var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Watch = require('../models/watch');
var jwt = require('jsonwebtoken');
var credentials = require('../credentials');



router.param('watchID', function (req, res, next, id) {
    Watch.findOne({_id:id},function (err, watch) {
        if(err||!watch)
            res.json({success:false,message:'Error finding watch with this id.'});
        else if(watch.email!=req.decoded.email)
            res.json({success:false, message:'You are not authorised to access this watch.'});
        else
            next();

    })
});
router.post('/auth',function (req, res) {
    User.findOne({email:req.body.email}).select('name email password').exec(function (err, user) {
        if(err||!user)
            res.json({success:false,message:'Error finding user'});
        else if(req.body.password){
            var validPassword = user.comparePassword(req.body.password);
            if(!validPassword)
                res.json({success:false, message:'Invalid Password'});
            else{
                var token = jwt.sign({
                        email: user.email,
                        id: user._id
                    },
                    credentials.jwt.secret,
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
    })
});

//middleware for authenticating requests to the api
router.use(function (req, res, next) {

    if(req.user){
        next();
    }else {
        var token = req.body.token || req.params.token ||req.headers['x-access-token'];

        if(token){
            jwt.verify(token,credentials.jwt.secret,function(err, decoded){
                if(err){
                    return res.status(403).send({success:false,message:'Failed to authenticate token'});
                }else{
                    req.decoded = decoded;
                    next();
                }
            })
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
    if(req.user&&!req.decoded)
        req.decoded = req.user;
    next();
});
router.get('/', function (req, res) {
    res.json({message:"Welcome to the api!"});
});

router.get('/watches',function (req, res) {
    Watch.find({email:req.decoded.email},function (err, watches) {
        if(err)
            res.json({success:false,message:err.message});
        else
            res.json(watches);

    })

});

//todo:post route for adding a watch

router.get('/watches/:watchID',function (req, res) {
    Watch.findOne({_id:req.params.watchID, email:req.decoded.email},function (err, watch) {
        if(err)
            res.json({success:false,message:err.message});
        else
            res.json(watch);
    })
});

router.delete('/watches/:watchID',function (req, res) {

    Watch.remove({_id:req.params.watchID, email:req.decoded.email},function (err) {
        if(err)
            res.json({success:false,message:err.message});
        else
            res.json({success:true});
    });
});


module.exports = router;