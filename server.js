var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');
var favicon = require('serve-favicon');

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
    UUID = require('pure-uuid'),
    Q = require('q');

app.set('port', process.env.PORT || 8081);

{ // configure server with error handlers, etc.
    app.use(cookieParser());
    app.use(methodOverride('_method'));
    app.use(favicon(path.join(root, './build/favicon.ico')));
    if (app.get('env') === 'development') {
        app.use(logger('dev'));
        app.use(errorHandler());
    }
}

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

app.post('/api/challenge/answer', jsonParser, function (req, res) {
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

app.get('/api/all', jsonParser, function (req, res) {
    trombinoscopeDb.getAllPeople()
        .then(function (people) {
            var peopleWithoutBinaryImage = [];
            people.forEach(function (person) {
                peopleWithoutBinaryImage.push({
                    "uuid": new UUID(5, 'xwhois', person.name).format(),
                    "name": person.name,
                    "image": req.protocol + '://' + req.get('host') + '/assets/images/xebians/' + person.name,
                    "lastModifiedDate": person.lastModifiedDate
                })
            });
            res.send({"xebians": peopleWithoutBinaryImage});
        })
        .fail(function (reason) {
            res.sendStatus(500).send(reason);
        });
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
        console.error(reason);
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
                lastModifiedDate: new Date("1981-12-24T08:30:00.000Z")
            });
        })
        .then(function () {
            return updatePerson({
                name: 'Cute Aligator',
                image: './test' + imagePath + '/Cute Aligator.gif',
                contentType: 'image/gif',
                lastModifiedDate: new Date("1982-02-24T17:10:00.000Z")
            });
        });
}
