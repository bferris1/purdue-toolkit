'use strict';
const config = require('../config');
let emailSender = {};
const applicationURL = process.env.URL || 'http://localhost:3000';
const fromAddress = 'watcher@' + config.get('hosting.domain');
const fromName = 'Class Watcher';
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(config.get('sendgrid.key'));
sgMail.setSubstitutionWrappers('-', '-');


// todo: error handling
emailSender.sendNotificationEmail = function (courseName, emailAddress, term, crn) {

	let text = 'A section that you are watching now has seats available.\n\nSee details at https://selfservice.mypurdue.purdue.edu/prod/bwckschd.p_disp_detail_sched?term_in=' + term + '&crn_in=' + crn;

	const msg = {
		to: emailAddress,
		from: {
			email: fromAddress,
			name: fromName
		},
		subject: 'Now Available: ' + courseName,
		text: text
	};

	return sgMail.send(msg);
};

emailSender.testMail = function (emailAddress) {

	const msg = {
		to: emailAddress,
		from: {
			email: fromAddress,
			name: fromName
		},
		subject: 'Testing Sendgrid',
		text: 'Testing Email Sending'
	};

	return sgMail.send(msg);

};

emailSender.sendPasswordResetEmail = function (emailAddress, resetToken) {
	let resetURL = applicationURL + '/reset/' + resetToken;

	const msg = {
		to: emailAddress,
		from: {
			email: fromAddress,
			name: fromName
		},
		subject: 'Purdue Class Watcher Password Reset',
		templateId: 'ad392fc9-55b7-4fef-9bae-3288156aec58',
		substitutions: {
			resetURL: resetURL
		}
	};

	return sgMail.send(msg);

};

module.exports = emailSender;