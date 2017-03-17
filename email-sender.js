'use strict';
var config = require('./config.json');
var sendgrid  = require('sendgrid')(config.sendgrid.key);
var emailSender = {};
const applicationURL = process.env.URL || 'http://localhost:3000';

//todo: error handling
emailSender.sendNotificationEmail = function (courseName, emailAddress, term, crn) {
    var email = new sendgrid.Email({
        to:emailAddress,
        from: 'notifications@puclass.space',
        fromname:'Purdue Class Watcher',
        subject:'Now Available: ' + courseName,
        text:'A section that you are watching now has seats available.\n\nSee details at https://selfservice.mypurdue.purdue.edu/prod/bwckschd.p_disp_detail_sched?term_in='+term+'&crn_in='+crn
    });
    sendgrid.send(email);
};

emailSender.testMail = function (emailAddress) {
    var email = new sendgrid.Email({
        to:emailAddress,
        from:'notification@puclass.space',
        fromname:'Class Watcher Notifications',
        subject:'Testing SetInterval',
        text:'This message tests the email sending functionality.'
    });
    sendgrid.send(email);
};

emailSender.sendPasswordResetEmail = function (emailAddress, resetToken, callback) {
    let email = new sendgrid.Email({
        to:emailAddress,
        from:'notifications@puclass.space',
        fromname:'Purdue Class Watcher',
        subject:'Class Watcher Password Reset',
        html:'this will be replaced by the template',
        text:applicationURL + '/reset/' + resetToken
    });
    email.addFilter('templates', 'enable', 1);
    email.addFilter('templates', 'template_id', 'ad392fc9-55b7-4fef-9bae-3288156aec58');
    email.addSubstitution('-resetURL-',applicationURL + '/reset/'+resetToken);

    sendgrid.send(email, callback);


};

module.exports = emailSender;