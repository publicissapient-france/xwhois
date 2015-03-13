var https = require('https');

function confuenceRequest(path, onCompleted, onError) {
    var content = '',
        request = https.get({
            'hostname': process.env.HOSTNAME,
            'path': path,
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
}

module.exports = {
    'content': function (id, onCompleted, onError) {
        confuenceRequest('/confluence/rest/prototype/1/content/' + id, onCompleted, onError);
    },
    'attachments': function (id, onCompleted, onError) {
        confuenceRequest('/confluence/rest/prototype/1/content/' + id + '/attachments', onCompleted, onError);
    }
};
