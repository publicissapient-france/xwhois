var http = require('http');

this.server = http.createServer(function(req, res) {
    res.writeHead(200);
    res.end('Salut tout le monde !');
});

exports.listen = function () {
    this.server.listen.apply(this.server, arguments);
};

exports.close = function (callback) {
    this.server.close(callback);
};
