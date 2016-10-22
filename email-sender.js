var sendgrid  = require('sendgrid')('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');
var emailSender = {};
var test = {
    sendEmail: function (message) {
        console.log(message);
    }
};

emailSender.sendNotificationEmail = function (courseName, emailAddress, term, crn) {
    var email = new sendgrid.Email({
        to:emailAddress,
        from: 'notifications@puclass.space',
        fromname:'Class Watcher Notifications',
        subject:'Now Available: ' + courseName,
        text:'A section that you are watching now has seats available.\n\nSee details at https://selfservice.mypurdue.purdue.edu/prod/bwckschd.p_disp_detail_sched?term_in='+term+'&crn_in='+crn
    });
    sendgrid.send(email);

};

emailSender.testMail = function () {
    var email = new sendgrid.Email({
        to:'ben.ferris1@gmail.com',
        from:'notification@puclass.space',
        fromname:'Class Watcher Notifications',
        subject:'Testing SetInterval',
        text:'This message is testing the setInterval functionality of Node.js'
    });
    test.sendEmail('hello');
    sendgrid.send(email);
};

module.exports = emailSender;