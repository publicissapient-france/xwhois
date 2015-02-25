var express = require('express');
var app = express();


app.get("/", function (req, res) {
        res.writeHead(200);
        res.end('Salut tout le monde !');
});

app.get("/api/challenge", function (req, res) {
    var challenge = {
        firstImage : 'Sébastian Le Merdy',
        secondImage : 'Antoine Michaud',
        name : 'Sébastian Le Merdy',
        answer : "firstImage"
    };
    res.send(challenge);
});

app.listen(8080);
