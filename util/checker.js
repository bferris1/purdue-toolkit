'use strict';
const config = require('../config.json');
const request = require('request');
const cheerio = require('cheerio');
const Watch = require('../models/watch');
const emailSender = require('./email-sender');
const Pushover = require('node-pushover');
const push = new Pushover({token:config.pushover.key});
const async = require('async');
let checker = {};

/*
given a term number and crn, parses the corresponding catalog page, extracting seat information and passes it
to a callback in object form
*/
//todo: better string formatting and error handling
checker.getSection = function(term, crn, callback){

    let section = {};

    request('https://selfservice.mypurdue.purdue.edu/prod/bwckschd.p_disp_detail_sched?term_in='+term+'&crn_in='+crn,function (err, res, html) {
        if(!err){
            var $ = cheerio.load(html);
            section.title = $('th.ddlabel').first().text();
            var seatsRow = $('table.datadisplaytable[summary="This layout table is used to present the seating numbers."]').children('tr').eq(1);
            section.totalSeats = seatsRow.children('td').first().text();
            section.filledSeats = seatsRow.children('td').eq(1).text();
            section.availableSeats = seatsRow.children('td').last().text();
            //cheerio parsing returns empty strings (?) if there is no value, so that's what we're checking for
            if(section.title &&section.totalSeats&&section.filledSeats&&section.availableSeats){
                let titleParts  = section.title.split(' - ');
                section.courseTitle = titleParts[0].trim();
                section.courseNumber = titleParts[2].trim();
                section.sectionNumber = titleParts[3].trim();
                callback(err, section);
            }else{
                callback(new Error('An error occurred while attempting to retrieve class information. Make sure the CRN is entered correctly.'), null)
            }
        }else{
            callback(err, null);
        }
    })

};

//iterates through all active class watches and sends email/pushover notifications if there are available seats
checker.checkWatches = function () {
    Watch.find({isActive:true}).populate('user').exec(function (err, watches) {
        if(err)
            return err;
        else{
            //this allows a callback to be called once all nested callbacks have completed
            //the outer function will not return until all callbacks complete
            async.each(watches, function (watch, cb) {
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
            });
        }
    });
};


module.exports = checker;