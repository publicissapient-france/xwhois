
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');
var favicon = require('serve-favicon');

var root = __dirname;
var challengeModule = require('./src/api/challenge');
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
    res.send(challengeModule.createChallenge('/assets/images/xebians'));
});

app.post('/api/challenge/answer', jsonParser, function (req, res) {
    var challengeResponse = req.body;
    if(challengeResponse.image && challengeResponse.name){
        res.send({result : challengeModule.validAnswer(challengeResponse)});
    // stockage du challenge
    } else {
        res.writeHead(400);
        res.end();
    }
});
app.use(express.static(path.join(root, './build/')));

app.listen(app.get('port'));
