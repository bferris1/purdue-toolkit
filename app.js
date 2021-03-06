const express = require('express');
const path = require('path');
const config = require('./config');
const logger = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const helmet = require('helmet');
const checker = require('./util/checker');
const applicationURL = process.env.URL || 'http://localhost:3000';

mongoose.Promise = require('bluebird');
mongoose.connect(config.get('db.url'), {
	reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
	reconnectInterval: 5000 // Reconnect every 5 sec
});

const routes = require('./routes/index');
const auth = require('./routes/auth');
const api = require('./routes/api');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

passport.use(new LocalStrategy(
	{
		usernameField: 'email'
	},
	function (email, password, done) {
		User.findOne({ email: email }).select('email password').exec(function (err, user) {
			if (err) { return done(err); }
			if (!user) {
				return done(null, false, { message: 'Incorrect email address.' });
			}
			if (!user.password)
				return done(null, false, {message: 'You don\'t have a password. Try a different method.'});
			if (!user.password || !user.comparePassword(password)) {
				return done(null, false, { message: 'Incorrect password.' });
			}
			return done(null, user);
		});
	}
));
passport.use(new GoogleStrategy({
	clientID: config.get('auth.google.clientID'),
	clientSecret: config.get('auth.google.clientSecret'),
	callbackURL: applicationURL + '/auth/google/callback'
},
function (accessToken, refreshToken, profile, done) {
	User.findOne({
		$or: [ { googleId: profile.id }, { email: profile.emails[0].value } ]
	}, function (err, user) {
		if (user)
			return done (err, user);
		else {
			let user = new User();
			user.googleId = profile.id;
			user.email = profile.emails[0].value;
			user.firstName = profile.name.givenName;
			user.lastName = profile.name.familyName;
			user.save().then(()=>{
				return done(null, user);
			});

		}
	});
}
));




// uncomment after placing your favicon/public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(helmet());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
	secret: config.get('session.secret'),
	store: new MongoStore({
		mongooseConnection: mongoose.connection,
		autoRemove: 'native' // Default
	}),
	name: config.get('session.name'),
	saveUninitialized: false,
	resave: false,
	cookie: {
		maxAge: 7*24*60*60*1000  // 1 week in milliseconds
	}

}));

app.use(flash());



passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', auth);
app.use('/', routes);
app.use('/api', api);

// check watches regularly, as defined in configuration file
setInterval(checker.checkWatches, 60000 * config.get('checkInterval'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	let err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function (err, req, res) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


module.exports = app;
