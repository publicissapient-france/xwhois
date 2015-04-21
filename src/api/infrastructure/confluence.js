var https = require('https'),
    url = require('url'),
    obfuscatedPassword = process.env.CONFLUENCE_PASSWORD === undefined ? 'undefined' : '*',
    confluenceURL = function (confluencePath) {
        return 'https://' + process.env.CONFLUENCE_USER + ':' + obfuscatedPassword + '@' + process.env.CONFLUENCE_HOSTNAME + confluencePath;
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
            confluencePath = path + expandParameter,
            request = https.get({
                'hostname': process.env.CONFLUENCE_HOSTNAME,
                'path': confluencePath,
                'auth': process.env.CONFLUENCE_USER + ':' + process.env.CONFLUENCE_PASSWORD
            }, function (response) {
                response.on('data', function (chunk) {
                    content += chunk;
                });

                response.on('end', function () {
                    if (response.statusCode === 401) {
                        error('confluence.confluenceRequest unauthorized request ' + confluenceURL(confluencePath), onError);
                        return;
                    }
                    if (response.statusCode == 404) {
                        error('confluence.confluenceRequest not found ' + confluenceURL(confluencePath), onError);
                        return;
                    }
                    onCompleted(content);
                });
            });

        request.on('error', function (e) {
            error('Error when connecting to ' + confluenceURL(path + expandParameter) + ': ' + e.message, onError);
        });
    },
    binaryConfluenceRequest = function (path, onCompleted, onError) {
        var buffers = [],
            options = {
                'hostname': process.env.CONFLUENCE_HOSTNAME,
                'path': path
            },
            request = https.get(options, function (response) {
                response.on('data', function (chunk) {
                    buffers.push(chunk);
                });

                response.on('end', function () {
                    if (response.statusCode === 401) {
                        error('confluence.confluenceRequest unauthorized request ' + JSON.stringify(options), onError);
                        return;
                    }
                    if (response.statusCode == 404) {
                        error('confluence.confluenceRequest not found ' + JSON.stringify(options), onError);
                        return;
                    }
                    onCompleted(Buffer.concat(buffers));
                });
            });

        request.on('error', function (e) {
            error('Error when connecting to ' + JSON.stringify(options) + ': ' + e.message, onError);
        });
    };

module.exports = {
    'checkEnvironmentVariables': function () {
        checkEnvironmentVariable('CONFLUENCE_USER', process.env.CONFLUENCE_USER);
        checkEnvironmentVariable('CONFLUENCE_PASSWORD', process.env.CONFLUENCE_PASSWORD);
        checkEnvironmentVariable('CONFLUENCE_HOSTNAME', process.env.CONFLUENCE_HOSTNAME);
    },
    'content': function (id, onCompleted, onError, expand) {
        confluenceRequest('/confluence/rest/prototype/1/content/' + id, onCompleted, onError, expand);
    },
    'attachments': function (id, onCompleted, onError, maxResults) {
        confluenceRequest('/confluence/rest/prototype/1/content/' + id + '/attachments' + (maxResults === undefined ? '' : '?max-results=' + maxResults), onCompleted, onError);
    },
    'download': function (downloadURL, onCompleted, onError) {
        binaryConfluenceRequest(url.parse(downloadURL).path, onCompleted, onError);
    }
};
