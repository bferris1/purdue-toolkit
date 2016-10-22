var sendgrid  = require('sendgrid')('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');
var request = require('request');
var cheerio = require('cheerio');
var Watch = require('./models/watch');
var checker = {};


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

checker.checkWatches = function (callback) {
    Watch.find({active:true}, function (err, watches) {
        if(err)
            callback(err, null);
        else{
            for(var i = 0;i<watches.length;i++){
                var watch = watches[i];
                checker.getSection(watch.term, watch.crn, function (err, section) {
                    if(section.availableSeats>0){
                        checker.sendNotificationEmail(section.title, watch.email, watch.term, watch.crn);
                    }
                })
            }
        }
    });
    console.log(watches);


};

checker.sendNotificationEmail = function (courseName, emailAddress, term, crn) {
    var email = new sendgrid.Email({
        to:emailAddress,
        from: 'notifications@puclasswatch.xyz',
        fromName:'Class Watcher Notifications',
        subject:'Now Available: ' + courseName,
        text:'A section that you are watching now has seats available.\n\nSee details at https://selfservice.mypurdue.purdue.edu/prod/bwckschd.p_disp_detail_sched?term_in='+term+'&crn_in='+crn
    });
    sendgrid.send(email);

};


checker.testMail = function () {
    var email = new sendgrid.Email({
        to:'ben.ferris1@gmail.com',
        from:'ben@moufee.com',
        subject:'Testing SetInterval',
        text:'This message is testing the setInterval functionality of Node.js'
    });
    sendgrid.send(email);
};

module.exports = checker;