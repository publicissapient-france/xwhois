var assert = require("assert"),
    http = require("http"),
    trombinoscopeDb = require('../../src/api/infrastructure/trombinoscopeDb');

describe('API Test', function () {
    var server, testDb, noListen;

    before(function (done) {
        testDb = savePreviousAndSet('TESTDB');
        app = require("../../server");
        app.addListener('done', function (initServer) {
            server = initServer;
            done();
        });
    });

    after(function (done) {
        if (server !== undefined) {
            server.close();
        }
        resetPrevious('TESTDB', testDb);
        trombinoscopeDb.reset().then(function () {
            return trombinoscopeDb.close()
        }).finally(done);
    });

    it('should return 200 and a message', function (done) {
        var url = 'http://localhost:' + app.get('port') + '/index.html',
            home = http.get(url, function (res) {
                assert.equal(200, res.statusCode);
                var data = '';
                res.on('data', function (chunk) {
                    data += chunk;
                });
                res.on('end', function () {
                    assert(data.indexOf("XWhois") >= 0);
                    done();
                });
            });
        home.on('error', function (error) {
            assert.fail(error.message, '', 'There was a error during connection to ' + url);
        });
    });

    it('should get a challenge', function (done) {
        var url = 'http://localhost:' + app.get('port') + '/api/challenge',
            challenge = http.get(url, function (res) {
            assert.equal(res.statusCode, 200);
            var data = '';
            res.on('data', function (chunk) {
                data += chunk;
            });

            res.on('end', function () {
                var jsonData = JSON.parse(data);
                assert.ok(jsonData.firstImage !== jsonData.secondImage, 'first image should be different than second image');
                var firstMatch = jsonData.firstImage.match('/assets/images/xebians/(Pretty Bear|Cute Aligator)');
                assert.notStrictEqual(firstMatch, null);
                var secondMatch = jsonData.secondImage.match('/assets/images/xebians/(Pretty Bear|Cute Aligator)');
                assert.notStrictEqual(secondMatch, null);
                assert.notStrictEqual([firstMatch[1], secondMatch[1]].indexOf(jsonData.name), -1, 'name should be one of first or second image');
                done();
            });
        });
        challenge.on('error', function (error) {
            assert.fail(error.message, '', 'There was a error during connection to ' + url);
            done();
        });
    });

    it('should win a challenge', function (done) {
        var answer = {image: '/assets/images/xebians/Firstname1 Lastname1', name: 'Firstname1 Lastname1' };
        var answerString = JSON.stringify(answer);
        var headers = {
            'Content-Type': 'application/json',
            'Content-Length': answerString.length
        };
        var options = {
            host: 'localhost',
            port: app.get('port'),
            path: '/api/challenge/answer',
            method: 'POST',
            headers: headers
        };

        var req = http.request(options, function (res) {
            assert.equal(200, res.statusCode);
            var data = '';
            res.on('data', function (chunk) {
                data += chunk;
            });

            res.on('end', function () {
                var jsonData = JSON.parse(data);
                assert.equal(jsonData.result, true, 'The challenge should be won');
                done();
            });
        });

        req.write(answerString);
        req.on('error', function (error) {
            assert.fail(error.message, '', 'There was a error during connection to ' + options);
            done();
        });
        req.end();
    });

    it('should lose a challenge', function (done) {
        var answer = {image: '/assets/images/xebians/Firstname1 Lastname1', name: 'Firstname3 Lastname1' };
        var answerString = JSON.stringify(answer);
        var headers = {
            'Content-Type': 'application/json',
            'Content-Length': answerString.length
        };
        var options = {
            host: 'localhost',
            port: app.get('port'),
            path: '/api/challenge/answer',
            method: 'POST',
            headers: headers
        };
        var req = http.request(options, function (res) {
            assert.equal(200, res.statusCode);
            var data = '';
            res.on('data', function (chunk) {
                data += chunk;
            });

            res.on('end', function () {
                var jsonData = JSON.parse(data);
                assert.equal(jsonData.result, false, 'The challenge should be lost');
                done();
            });
        });

        req.write(answerString);
        req.on('error', function (error) {
            assert.fail(error.message, '', 'There was a error during connection to ' + options);
            done();
        });
        req.end();
    });

    it('should not valid challenge answer', function (done) {
        var headers = {
            'Content-Type': 'application/json'
        };
        var options = {
            host: 'localhost',
            port: app.get('port'),
            path: '/api/challenge/answer',
            method: 'POST',
            headers: headers
        };
        var req = http.request(options, function (res) {
            assert.equal(400, res.statusCode);
            done();
        });
        req.write("{}");
        req.on('error', function (error) {
            assert.fail(error.message, '', 'There was a error during connection to ' + options);
            done();
        });
        req.end();
    });

    it('should get all xebians', function (done) {
        var url = 'http://localhost:' + app.get('port') + '/api/all',
            req = http.get(url, function (res) {
                assert.equal(200, res.statusCode);
                var data = '';
                res.on('data', function (chunk) {
                    data += chunk;
                });

                res.on('end', function () {
                    var jsonData = JSON.parse(data);
                    assert.equal(jsonData.length, 2, 'There should be two people');
                    assert.equal(jsonData[0].uuid, '95f02eed-d278-57a3-a018-688c1baa159b', 'First person\'s uuid');
                    assert.equal(jsonData[0].name, 'Pretty Bear', 'First person\'s name');
                    assert.equal(jsonData[0].image, 'http://localhost:' + app.get('port') + '/assets/images/xebians/Pretty Bear', 'First person\'s image url');
                    assert.equal(jsonData[0].lastModifiedDate, '1981-12-24T08:30:00.000Z', 'First person\'s last modified date');
                    assert.equal(jsonData[1].uuid, '45662418-173f-5537-acfc-0871e07ce38e', 'Second person\'s uuid');
                    assert.equal(jsonData[1].name, 'Cute Aligator', 'Second person\'s name');
                    assert.equal(jsonData[1].image, 'http://localhost:' + app.get('port') + '/assets/images/xebians/Cute Aligator', 'Second person\'s image url');
                    assert.equal(jsonData[1].lastModifiedDate, '1982-02-24T17:10:00.000Z', 'Second person\'s last modified date');
                    done();
                });
            });
        req.on('error', function (error) {
            assert.fail(error.message, '', 'There was a error during connection to ' + options);
            done();
        });
        req.end();
    });

    function savePreviousAndSet(environmentVariableName) {
        var previous = process.env[environmentVariableName];
        process.env[environmentVariableName] = true;
        return previous;
    }

    function resetPrevious(environmentVariableName, previousValue) {
        if (previousValue === undefined) {
            delete process.env[environmentVariableName];
        } else {
            process.env[environmentVariableName] = previousValue;
        }
    }
});
