
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');

var root = __dirname;
var port = process.argv[2] || 8080;
var challengeModule = require('./src/api/challenge');
var app = module.exports = express();

{ // configure server with error handlers, etc.
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(methodOverride('_method'));
    if (app.get('env') === 'development') {
        app.use(errorHandler());
    }
}

app.get('/api/challenge', function (req, res) {
    res.send(challengeModule('./src/assets/images/xebians', '/assets/images/xebians').createChallenge());
});
app.use(express.static(path.join(root, './build/')));

app.listen(port);
