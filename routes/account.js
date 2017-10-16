const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/',function(req, res){
    if(req.user) res.render('account');
    else res.redirect('/login');
});

router.post('/', function (req, res) {
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


module.exports = router;