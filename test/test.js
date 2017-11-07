'use strict';
let assert = require('chai').assert;
let User = require('../models/user');
let Watch = require('../models/watch');
let Pushover = require('node-pushover');
let credentials = require('../config.json');
let push = new Pushover({token:credentials.pushover.key});
let mongoose = require('mongoose');
let sender = require('../email-sender');
mongoose.Promise = require('bluebird');
mongoose.connect(credentials.db.url,{
    useMongoClient:true
});


describe('Pushover', function () {
       it('should successfully send a pushover notification',function (done) {
           this.timeout(4000);
           push.send(credentials.testing.pushover_key, 'Purdue Toolkit Pushover Testing', 'TESTING: Class Available!', done);
       });
});

// describe('User', function () {
//     describe('creation', function () {
//         it('should be created successfully', function (done) {
//             let user = new User();
//             user.email = credentials.testing.email;
//             user.password = credentials.testing.password;
//             user.save(done);
//         })
//     });
// });

// describe('Watch', function () {
//     describe('creation', function () {
//         it('should find a watch successfully', function (done) {
//             Watch.find().populate('user').exec(function (err, watch) {
//                 if(err) done(err);
//                 console.log(watch);
//                 done();
//             })
//         })
//     });
// });

describe('Email',function () {
    it('should send without error',function (done) {
        sender.testMail('ben.ferris1@gmail.com', done);
    })
});

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    });
  });
});
