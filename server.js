var express = require('express');
var challengeModule = require('./src/api/challenge');
var app = express();


app.get("/", function (req, res) {
        res.writeHead(200);
        res.end('Salut tout le monde !');
});

app.get("/api/challenge", function (req, res) {
    res.send(challengeModule('./src/assets/images/xebians', '/assets/images/xebians').createChallenge());
});

app.listen(8080);
