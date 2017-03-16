var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var password = 'nacre-means-scion';
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('express-flash');
var helmet = require('helmet');
var expressValidator = require('express-validator');
var checker = require('./checker');
var credentials = require('./credentials.json');
mongoose.Promise = require('bluebird');
mongoose.connect(credentials.db.url);

var routes = require('./routes/index');
var users = require('./routes/users');
var api = require('./routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

passport.use(new LocalStrategy(
    {
        usernameField:'email'
    },
    function(email, password, done) {
        User.findOne({ email: email }).select('email password').exec(function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect email address.' });
            }
            if (!user.comparePassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
));


// uncomment after placing your favicon/public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(flash());
app.use(helmet());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: credentials.session.secret,
    store: new MongoStore({
        mongooseConnection:mongoose.connection,
        autoRemove: 'native' // Default
    }),
    name: credentials.session.name,
    saveUninitialized:false,
    resave:false,
    cookie: {
        expires: new Date(Date.now()+(1000*60*60*24))  // 1 day
    }

}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});


app.use('/', routes);
app.use('/users', users);
app.use('/api', api);

//check watches every 5 minutes
setInterval(checker.checkWatches,1000*15);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
