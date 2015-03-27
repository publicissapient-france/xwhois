var https = require('https'),
    extractPathFrom = function (url) {
        return url.substring(('https://' + process.env.HOSTNAME).length, url.length);
    },
    obfuscatedPassword = process.env.PASSWORD === undefined ? '?' : '*'.times(process.env.PASSWORD.length),
    url = function (path) {
        return 'https://' + process.env.USER + ':' + obfuscatedPassword + '@' + process.env.HOSTNAME + path;
    },
    error = function (message, onError) {
        if (onError === undefined) {
            console.log(message);
        } else {
            onError(message);
        }
    };

function confuenceRequest(path, onCompleted, onError, expand) {
    var content = '',
        expandParameter = (expand === undefined ? '' : '?expand=' + expand.join(',')),
        request = https.get({
            'hostname': process.env.HOSTNAME,
            'path': path + expandParameter,
            'auth': process.env.USER + ':' + process.env.PASSWORD
        }, function (response) {
            response.on('data', function (chunk) {
                content += chunk;
            });

            response.on('end', function () {
                if (response.statusCode === 401) {
                    error('confluence.confluenceRequest unauthorized request ' + url(path + expandParameter), onError);
                    return;
                }
                onCompleted(content);
            });
        });

    request.on('error', function (e) {
        error('Error when connecting to ' + url(path + expandParameter) + ': ' + e.message, onError);
    });
}

module.exports = {
    'content': function (id, onCompleted, onError, expand) {
        confuenceRequest('/confluence/rest/prototype/1/content/' + id, onCompleted, onError, expand);
    },
    'attachments': function (id, onCompleted, onError) {
        confuenceRequest('/confluence/rest/prototype/1/content/' + id + '/attachments', onCompleted, onError);
    },
    'download': function (url, onCompleted, onError) {
        confuenceRequest(extractPathFrom(url), onCompleted, onError);
    }
};
