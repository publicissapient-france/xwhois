var https = require('https');

var Confluence = function () {
};

Confluence.prototype.content = function (id, onCompleted, onError) {
    var content = '',
        request = https.get({
            'hostname': process.env.HOSTNAME,
            'path': '/confluence/rest/prototype/1/content/' + id,
            'auth': process.env.USER + ':' + process.env.PASSWORD
        }, function (response) {
            response.on('data', function (chunk) {
                content += chunk;
            });

            response.on('end', function () {
                onCompleted(content);
            });
        });

    request.onError('error', function (e) {
        console.log(e);
        onError(e);
    });
};

module.exports = new Confluence();
