'use strict';
var credentials = require('./credentials.json');
var sendgrid  = require('sendgrid')(credentials.sendgrid.key);
var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var async = require('async');
var checker = require('./checker');
var emailSender = require('./email-sender');
var Pushover = require('node-pushover');
let push = new Pushover({token:credentials.pushover.key});
mongoose.connect(credentials.db.url);
var Watch = require('./models/watch');
let User = require('./models/user');

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});

var checkWatches = function () {
    Watch.find({isActive:true}).populate('user').exec(function (err, watches) {
        if(err)
            return err;
        else{
            //this allows a callback to be called once all nested callbacks have completed
            async.each(watches, function (watch, cb) {
                console.log(watch._id);
                checker.getSection(watch.term, watch.crn, function (err, section) {
                    if(!err&&section&&section.availableSeats>0){
                        if(watch.user && watch.user.pushoverKey){
                            push.send(watch.user.pushoverKey, "Class Available: "+watch.title, watch.title+" is now available.")
                        }
                        emailSender.sendNotificationEmail(section.title,watch.email,watch.term,watch.crn);
                        watch.isActive = false;
                        watch.resolvedDate = Date.now();
                        watch.save(function (err, watch) {
                            // console.log(watch);
                            cb(err);
                        })
                    }else{
                        //callback must be called either way
                        cb();
                    }

                })
            },function (err) {
                if(err)
                    console.log(err);
                    mongoose.disconnect();
            });
        }
    });
};

checkWatches();


