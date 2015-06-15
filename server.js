var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');
var favicon = require('serve-favicon');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var root = __dirname;
var imagePath = '/assets/images/xebians',
    challenge = require('./src/api/challenge')(imagePath),
    confluence = require('./src/api/infrastructure/confluence'),
    trombinoscope = require('./src/api/trombinoscope'),
    trombinoscopeDb = require('./src/api/infrastructure/trombinoscopeDb'),
    CronJob = require('cron').CronJob,
    app = module.exports = express(),
    jsonParser = bodyParser.json(),
    fs = require('fs'),
    Q = require('q');

app.set('port', process.env.PORT || 8081);

passport.use(new GoogleStrategy({
    clientID: '13229706518-7q72jrhasf3lhprslqaiejg716arcivf.apps.googleusercontent.com',
    clientSecret: 'Ex6D4zkQu6SmPBQgohhJoUAC',
    callbackURL: 'http://localhost:8081/auth/google/callback'
}, function (accessToken, refreshToken, profile, done) {
    if (/@xebia\.fr$/.matches(profile.userId)) {
        return done(null, profile);
    }
}));

{ // configure server with error handlers, etc.
    app.use(cookieParser());
    app.use(methodOverride('_method'));
    app.use(favicon(path.join(root, './build/favicon.ico')));
    if (app.get('env') === 'development') {
        app.use(logger('dev'));
        app.use(errorHandler());
    }
    app.use(require('express-session')({
        secret: 'secret cat',
        resave: true,
        saveUninitialized: true
    }));
    app.use(passport.initialize());
    app.use(passport.session());
}

app.get('/auth/google',
    passport.authenticate('google', {scope: 'https://www.googleapis.com/auth/plus.login'}));

app.get('/auth/google/callback',
    passport.authenticate('google', {failureRedirect: '/'}),
    function (req, res) {
        console.log('Auth Ok in google callback, redirecting to root');
        res.redirect('/');
    });

app.get('/api/challenge', jsonParser, function (req, res) {
    challenge.createChallenge()
        .then(function (challenge) {
            res.send(challenge);
        })
        .fail(function (reason) {
            res.writeHead(400, reason);
        })
        .fin(function () {
            res.end();
        });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        console.log('Req is authenticated in ensureAuth, letting user pass');
        return next();
    }
    console.log('Req not authenticated in ensureAuth, redirecting to root');
    res.redirect('/');
}

app.get('/hello', ensureAuthenticated, function (req, res) {
    res.send('Hello!');
});

app.post('/api/challenge/answer', jsonParser, function (req, res) {
    var challengeResponse = req.body;
    if (challengeResponse.image && challengeResponse.name) {
        res.send({result: challenge.validAnswer(challengeResponse)});
        // stockage du challenge
    } else {
        res.writeHead(400);
        res.end();
    }
});

app.get(imagePath + '/:name', function (req, res) {
    var person = trombinoscopeDb.findPerson(req.params.name)
        .then(function (person) {
            if (!person) {
                res.sendStatus(404);
                return;
            }

            res.set('Content-Type', person.contentType);
            res.end(person.image);
        })
        .fail(function (reason) {
            res.send(500).send(reason);
        });
});
app.use(express.static(path.join(root, './build/')));

trombinoscopeDb.connect()
    .then(function () {
        if (process.env.TESTDB) {
            setupDatabaseForTestingPurpose()
                .then(listen)
                .fail(function (error) {
                    console.log(error);
                });
            return;
        }

        if (process.env.CONFLUENCE) {
            confluence.checkEnvironmentVariables();
            trombinoscope.checkEnvironmentVariable();

            trombinoscope.parsePeople();
            new CronJob({
                cronTime: '0 0 1 * * *',
                onTick: function () {
                    trombinoscope.parsePeople();
                },
                start: true
            });
        }

        listen();
    })
    .fail(function (reason) {
        console.log(reason);
    });

function listen() {
    app.set('port', process.env.PORT || 8081);
    var server = app.listen(app.get('port'));
    app.emit('done', server);
}

function setupDatabaseForTestingPurpose() {
    function updatePerson(person) {
        return Q.nfcall(fs.readFile, person.image)
            .then(function (data) {
                person.image = new Buffer(data);
                return person;
            })
            .then(function (person) {
                return trombinoscopeDb.updatePerson(person);
            });
    }

    return trombinoscopeDb.reset()
        .then(function () {
            return updatePerson({
                name: 'Pretty Bear',
                image: './test' + imagePath + '/Pretty Bear.png',
                contentType: 'image/png',
                lastModifiedDate: new Date()
            });
        })
        .then(function () {
            return updatePerson({
                name: 'Cute Aligator',
                image: './test' + imagePath + '/Cute Aligator.gif',
                contentType: 'image/gif',
                lastModifiedDate: new Date()
            });
        });
}

module.exports = app;
