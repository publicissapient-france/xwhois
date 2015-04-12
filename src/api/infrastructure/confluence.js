var https = require('https'),
    extractPathFrom = function (url) {
        return url.substring(('https://' + process.env.CONFLUENCE_HOSTNAME).length, url.length);
    },
    obfuscatedPassword = process.env.CONFLUENCE_PASSWORD === undefined ? '?' : '*',
    url = function (path) {
        return 'https://' + process.env.CONFLUENCE_USER + ':' + obfuscatedPassword + '@' + process.env.CONFLUENCE_HOSTNAME + path;
    },
    error = function (message, onError) {
        if (onError === undefined) {
            console.log(message);
        } else {
            onError(message);
        }
    },
    checkEnvironmentVariable = function (name, value) {
        if (value === undefined) {
            throw 'Environment variable ' + name + ' should be defined';
        }
    },
    confluenceRequest = function (path, onCompleted, onError, expand) {
        var content = '',
            expandParameter = expand === undefined ? '' : '?expand=' + expand.join(','),
            request = https.get({
                'hostname': process.env.CONFLUENCE_HOSTNAME,
                'path': path + expandParameter,
                'auth': process.env.CONFLUENCE_USER + ':' + process.env.CONFLUENCE_PASSWORD
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
    };

module.exports = {
    'checkEnvironmentVariables': function () {
        checkEnvironmentVariable('CONFLUENCE_USER', process.env.CONFLUENCE_USER);
        checkEnvironmentVariable('', process.env.CONFLUENCE_PASSWORD);
        checkEnvironmentVariable('CONFLUECONFLUENCE_PASSWORDNCE_HOSTNAME', process.env.CONFLUENCE_HOSTNAME);
    },
    'content': function (id, onCompleted, onError, expand) {
        confluenceRequest('/confluence/rest/prototype/1/content/' + id, onCompleted, onError, expand);
    },
    'attachments': function (id, onCompleted, onError, maxResults) {
        confluenceRequest('/confluence/rest/prototype/1/content/' + id + '/attachments' + (maxResults === undefined ? '' : '?max-results=' + maxResults), onCompleted, onError);
    },
    'download': function (url, onCompleted, onError) {
        confluenceRequest(extractPathFrom(url), onCompleted, onError);
    }
};
