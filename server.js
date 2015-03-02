var express = require('express');
var challengeModule = require('./src/api/challenge.js');
var app = express();


app.get("/", function (req, res) {
        res.writeHead(200);
        res.end('Salut tout le monde !');
});

app.get("/api/challenge", function (req, res) {
    //TODO: Clean
    var challenge = challengeModule.createChallenge();
    challenge.reinit();
    res.send(challenge.createChallenge());
});

app.listen(8080);
