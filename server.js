
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');
var favicon = require('serve-favicon');

var root = __dirname;
var challenge = require('./src/api/challenge')('/assets/images/xebians'),
    trombinoscopeDb = require('./src/api/infrastructure/trombinoscopeDb'),
    fs = require('fs');
var app = module.exports = express();
var jsonParser = bodyParser.json();

app.set('port', process.argv[2] || process.env.PORT || 8081);

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
    try {
        res.send(challenge.createChallenge());
    } catch (errorMessage) {
        res.writeHead(400, errorMessage);
    }
    res.end();
});

app.post('/api/challenge/answer', jsonParser, function (req, res) {
    var challengeResponse = req.body;
    if(challengeResponse.image && challengeResponse.name){
        res.send({result : challenge.validAnswer(challengeResponse)});
    // stockage du challenge
    } else {
        res.writeHead(400);
        res.end();
    }
});
app.get('/assets/images/xebians/:name', function (req, res) {
    var person = trombinoscopeDb.findPerson(req.params.name);

    if (person === undefined) {
        res.sendStatus(404);
        return;
    }

    res.set('Content-Type', person['contentType']);
    res.end(person.image);
});
app.use(express.static(path.join(root, './build/')));

// ugly mocks until trombinoscopeDb is persisted

var updatePerson = function (person, done) {
    fs.readFile(person.image, function (error, data) {
        if (error) {
            throw error;
        }
        person.image = new Buffer(data);
        done(person);
    });
};

updatePerson({
    name: 'Antoine Michaud',
    image: './src/assets/images/xebians/Antoine Michaud.jpg',
    contentType: 'image/jpeg',
    lastModifiedDate: new Date()
}, function (person) {
    trombinoscopeDb.updatePerson(person);
});

updatePerson({
    name: 'Sébastian Le Merdy',
    image: './src/assets/images/xebians/Sebastian Le Merdy.jpg',
    contentType: 'image/jpeg',
    lastModifiedDate: new Date()
}, function (person) {
    trombinoscopeDb.updatePerson(person);
});

app.listen(app.get('port'));
