var credentials = require('./credentials.json');
var sendgrid  = require('sendgrid')(credentials.sendgrid.key);
var request = require('request');
var cheerio = require('cheerio');
var Watch = require('./models/watch');
var emailSender = require('./email-sender');
var checker = {};

/*
given a term number and crn, parses the corresponding catalog page, extracting seat information and passes it
to a callback in object form
*/
checker.getSection = function(term, crn, callback){

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
                callback(new Error('An error occurred while attempting to retrieve class information. Make sure the CRN is entered correctly.'), null)
            }
        }else{
            callback(err, null);
        }
    })

};

//iterates through all active class watches and sends email notifications if there are available seats
checker.checkWatches = function (callback) {
    Watch.find({active:true}, function (err, watches) {
        if(err)
            callback(err, null);
        else{
            for(var i = 0;i<watches.length;i++){
                var watch = watches[i];
                checker.getSection(watch.term, watch.crn, function (err, section) {
                    if(section.availableSeats>0){
                        emailSender.sendNotificationEmail(section.title, watch.email, watch.term, watch.crn);
                    }
                })
            }
        }
    });
    console.log(watches);


};


module.exports = checker;