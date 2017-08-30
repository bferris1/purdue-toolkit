const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const helmet = require('helmet');
const expressValidator = require('express-validator');
const checker = require('./checker');
const config = require('./config.json');
mongoose.Promise = require('bluebird');
mongoose.connect(config.db.url,{
    useMongoClient:true
});

const routes = require('./routes/index');
const users = require('./routes/users');
const api = require('./routes/api');

const app = express();

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
app.use(helmet());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: config.session.secret,
    store: new MongoStore({
        mongooseConnection:mongoose.connection,
        autoRemove: 'native' // Default
    }),
    name: config.session.name,
    saveUninitialized:false,
    resave:false,
    cookie: {
        maxAge: 7*24*60*60*1000  // 1 week in milliseconds
    }

}));

app.use(flash());



passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

app.use(passport.initialize());
app.use(passport.session());


app.use('/', routes);
app.use('/users', users);
app.use('/api', api);

//check watches regularyly, as defined in configuration file
setInterval(checker.checkWatches,60000*config.checker.interval);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found');
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
