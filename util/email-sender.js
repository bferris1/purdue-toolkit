'use strict';
const config = require('../config');
const sendgrid  = require('sendgrid')(config.get('sendgrid.key'));
const helper = require('sendgrid').mail;
let emailSender = {};
const applicationURL = process.env.URL || 'http://localhost:3000';
let fromAddress = 'watcher@'+config.get('hosting.domain');


function send (message, callback) {

	let request = sendgrid.emptyRequest({
		method: 'POST',
		path: '/v3/mail/send',
		body: message.toJSON()
	});

	sendgrid.API(request, function (err, response) {
		if (err) {
			console.log(JSON.stringify(err));
			if (callback)
				callback(err);
		}
		else {
			console.log(response.statusCode);
			if (callback)
				callback(null, {});
		}
	});
}



// todo: error handling
emailSender.sendNotificationEmail = function (courseName, emailAddress, term, crn) {
	let from = new helper.Email(fromAddress, 'Class Watcher');
	let to = new helper.Email(emailAddress);
	let subject = 'Now Available: ' + courseName;
	let text = 'A section that you are watching now has seats available.\n\nSee details at https://selfservice.mypurdue.purdue.edu/prod/bwckschd.p_disp_detail_sched?term_in='+term+'&crn_in='+crn;
	let content = new helper.Content('text/plain', text);
	let message = new helper.Mail(from, subject, to, content);


	send(message);
};

emailSender.testMail = function (emailAddress, callback) {
	let from = new helper.Email(fromAddress, 'Class Watcher Notifications');
	let to = new helper.Email(emailAddress);
	let subject = 'Sendgrid Testing';
	let content = new helper.Content('text/plain', 'Testing email sending');
	let message = new helper.Mail(from, subject, to, content);
	let mailSettings = new helper.MailSettings();
	mailSettings.setSandBoxMode(new helper.SandBoxMode(true));
	message.addMailSettings(mailSettings);

	send(message, callback);
};

emailSender.sendPasswordResetEmail = function (emailAddress, resetToken, callback) {
	let resetURL = applicationURL+'/reset/'+resetToken;

	let from = new helper.Email(fromAddress, config.get('sendgrid.fromName'));
	let to = new helper.Email(emailAddress);
	let subject = 'Class Watcher Password Reset';
	let message = new helper.Mail();
	message.setFrom(from);
	message.setTemplateId('ad392fc9-55b7-4fef-9bae-3288156aec58');
	let personalization = new helper.Personalization();
	let substitution = new helper.Substitution('-resetURL-', resetURL);
	personalization.addSubstitution(substitution);
	personalization.addTo(to);
	personalization.setSubject(subject);
	let content = new helper.Content('text/plain', resetURL);
	let contentHTML = new helper.Content('text/html', resetURL);

	message.addContent(content);
	message.addContent(contentHTML);

	message.addPersonalization(personalization);

	send(message, callback);


};

module.exports = emailSender;