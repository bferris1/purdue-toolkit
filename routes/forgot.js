const express = require('express');
const router = express.Router();
const User = require('../models/user');
const crypto = require('crypto');
const emailSender = require('../email-sender');

router.get('/',function(req, res){
    if(req.user) res.redirect('/');
    res.render('forgot');
});

//route for requesting a password reset
router.post('/',function (req, res) {
    //redirect if the user is logged in
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
                    if(err){
                        res.status(err.status || 500);
                        res.render('error', {message:err.message, err:err});
                    }
                    user.resetToken = buff.toString('hex');
                    user.resetExpiration = Date.now()+3600000; //expires in one hour
                    user.save(function (err, user) {
                        if(err)
                            res.send('error');
                        else{
                            //send a reset email to the user
                            emailSender.sendPasswordResetEmail(user.email, user.resetToken, function (err, json) {
                                if(err) {
                                    console.log(err);
                                    res.status(err.status || 500);
                                    res.render('error',{message:err.message, error:err});
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

module.exports = router;