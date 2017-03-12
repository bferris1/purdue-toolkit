var credentials = require('./credentials.json');
var sendgrid  = require('sendgrid')(credentials.sendgrid.key);
var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var async = require('async');
var emailSender = require('./email-sender');
mongoose.connect(credentials.db.url);
var Watch = require('./models/watch');

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});


var getSection = function(term, crn, callback){

    var section = {};

    request('https://selfservice.mypurdue.purdue.edu/prod/bwckschd.p_disp_detail_sched?term_in='+term+'&crn_in='+crn,function (err, res, html) {
        if(!err){
            var $ = cheerio.load(html);
            section.title = $('th.ddlabel').first().text();
            var seatsRow = $('table.datadisplaytable[summary="This layout table is used to present the seating numbers."]').children('tr').eq(1);
            section.totalSeats = seatsRow.children('td').first().text();
            section.filledSeats = seatsRow.children('td').eq(1).text();
            section.availableSeats = seatsRow.children('td').last().text();
            if(section.title&&section.totalSeats&&section.filledSeats&&section.availableSeats){
                callback(err, section);
            }else{
                callback(new Error('An error occurred when attempting to retrieve class information. Make sure the CRN is entered correctly.'), null)
            }
        }else{
            callback(err, null);
        }
    })

};

var checkWatches = function () {
    Watch.find({isActive:true}, function (err, watches) {
        if(err)
            callback(err, null);
        else{
            //this allows a callback to be called once all nested callbacks have completed
            async.each(watches, function (watch, cb) {
                console.log(watch._id);
                getSection(watch.term, watch.crn, function (err, section) {
                    if(!err&&section&&section.availableSeats>0){
                        emailSender.sendNotificationEmail(section.title,watch.email,watch.term,watch.crn);
                        watch.isActive = false;
                        watch.save(function (err, watch) {
                            console.log(watch);
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


