var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');
var favicon = require('serve-favicon');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var root = __dirname;
var imagePath = '/assets/images/xebians',
    challenge = require('./src/api/challenge')(imagePath),
    confluence = require('./src/api/infrastructure/confluence'),
    trombinoscope = require('./src/api/trombinoscope'),
    trombinoscopeDb = require('./src/api/infrastructure/trombinoscopeDb'),
    challengeDb = require('./src/api/infrastructure/challengeDb'),
    CronJob = require('cron').CronJob,
    app = module.exports = express(),
    jsonParser = bodyParser.json(),
    fs = require('fs'),
    Q = require('q');

app.set('port', process.env.PORT || 8081);

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

var passport = require('passport');

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: '13229706518-7q72jrhasf3lhprslqaiejg716arcivf.apps.googleusercontent.com',
    clientSecret: 'Ex6D4zkQu6SmPBQgohhJoUAC',
    callbackURL: 'http://localhost:8081/auth/google/callback'
}, function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
        console.log('User is from:', JSON.stringify(profile._json.domain));
        if (/^xebia\.fr$/.test(profile._json.domain)) {
            console.log('User is from xebia.fr, letting pass');
            return done(null, profile);
        } else {
            console.log('User is not from xebia.fr');
            return done('User is not from xebia.fr!');
        }
    });
}));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

// Route to log out
app.get('/logout', function (req, res) {
    req.logOut();
    res.send(200);
});

// Route to log in
app.get(
    '/auth/google',
    passport.authenticate('google', {
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    }),
    function (req, res) {
        // This never gets called
    }
);

// TODO redirect to frontend home with token as parameter
app.get(
    '/auth/google/callback',
    function (req, res, next) {
        passport.authenticate(
            'google', function (err, user, info) {
                if (err) {
                    return next(err);
                }
                if (!user) {
                    return res.redirect('/login');
                }
                res.writeHead(302, {'Location': 'http://localhost:4000?authToken=' + user.token});
            })(req, res, next);
    });

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        console.log('Req is authenticated in ensureAuth, letting user pass');
        return next();
    } else {
        console.log('Req not authenticated in ensureAuth, redirecting to login');
        res.redirect('/auth/google');
    }
}

app.get('/api/challenge', jsonParser, ensureAuthenticated, function (req, res) {
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

app.post('/api/challenge/answer', jsonParser, ensureAuthenticated, function (req, res) {
    var challengeResponse = req.body;
    if (challengeResponse.image && challengeResponse.name) {
        var result = challenge.validAnswer(challengeResponse);
        challengeDb.saveChallenge('toto', challengeResponse, result ? 1 : -1)
            .then(function () {
                res.send({result: result});
            })
            .fail(function (reason) {
                res.send(500).send(reason);
            });
    } else {
        res.writeHead(400);
        res.end();
    }
});

app.get(imagePath + '/:name', ensureAuthenticated, function (req, res) {
    trombinoscopeDb.findPerson(req.params.name)
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

/*
app.get('/api/score/:name', jsonParser, function (req, res) {
    var challenges = challengeDb.getChallengesByName(req.params.name).then(function (challenges) {
        if (!challenges) {
            res.sendStatus(404);
            return;
        }
        res.set('Content-Type', "application/json");
        res.end(challenges);
    })
        .fail(function (reason) {
            res.send(500).send(reason);
        });
});
*/
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
            //noinspection JSUnusedGlobalSymbols
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
