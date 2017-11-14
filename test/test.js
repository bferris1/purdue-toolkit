'use strict';
const chai = require('chai');
// const should = chai.should();
// const server = require('../bin/www');
const expect = chai.expect;
const assert = require('chai').assert;
const User = require('../models/user');
const Watch = require('../models/watch');
const Pushover = require('node-pushover');
const credentials = require('../config.json');
const push = new Pushover({token: credentials.pushover.key});
const mongoose = require('mongoose');
const sender = require('../util/email-sender');
const checker = require('../util/checker');
const format = require('../util/stringFormatter');
mongoose.Promise = require('bluebird');
mongoose.connect(credentials.db.url, {
	useMongoClient: true
});


after(function () {
	mongoose.connection.close();
});

describe('Pushover', function () {
	it('should successfully send a pushover notification', function (done) {
		this.timeout(4000);
		push.send(credentials.testing.pushover_key, 'Purdue Toolkit Pushover Testing', 'TESTING!', done);
	});
});

describe('User', function () {
	this.timeout(1000);
	it('should be created successfully', function (done) {
		let user = new User();
		user.email = credentials.testing.email;
		user.password = credentials.testing.password;
		user.save(done);
	});

	it('should be updated successfully', function (done){
		User.findOne({email: credentials.testing.email}, function (err, user) {
			if (err){done(err);}
			assert.equal(user.email, credentials.testing.email);
			user.firstName = 'NewFirstName';
			user.save(function (err, user) {
				if (err) done(err);
				assert.equal(user.firstName, 'NewFirstName');
				done();
			});
		});
	});

	it('should be deleted successfully', function (done){
		User.remove({email: credentials.testing.email}, done);
	});
});

describe('Checker', function () {

	it('should correctly parse a valid class', function (done) {
		checker.getSection(201820, 13032, function (err, section) {
			if (err) done(err);
			expect(section).to.be.an('object');
			expect(section).to.have.property('title');
			expect(section.title).to.be.a('string');
			expect(section.title).to.equal('Operating Systems - 13032 - CS 35400 - LE1');
			expect(section.courseTitle).to.equal('Operating Systems');
			expect(section.sectionNumber).to.equal('LE1');
			expect(section.courseNumber).to.equal('CS 35400');
			console.log(section);
			done();
		});
	});

	it('should return an error for an invalid crn', function (done) {
		checker.getSection(201820, 1234567, function (err, section) {
			expect(section).to.be.null;
			expect(err).to.be.an('error');
			expect(err).to.have.property('message');
			expect(err.message).to.equal('An error occurred while attempting to retrieve class information. Make sure the CRN is entered correctly.');
			done();
		});
	});

	it('should return an error for an invalid term', function (done) {
		checker.getSection(123123, 13032, function (err, section) {
			expect(section).to.be.null;
			expect(err).to.be.an('error');
			expect(err).to.have.property('message');
			done();
		});
	});

	it('should format correctly', function () {
		let result = format.watchSuccess({courseTitle: 'testing', courseNumber: 'CS 1234', sectionNumber: '001'});
		expect(result).to.be.a('string');
		console.log(result);
	});
});

describe('Watch', function () {
	it('should be created without error', function (done) {
		let watch = new Watch();
		watch.term = 201810;
		watch.crn = 13032;
		watch.email = credentials.testing.email;
		done();
	});
});


describe('Email', function () {
	this.timeout(4000);
	it('should send without error', function (done) {
		sender.testMail(credentials.testing.email, done);
	});
});
