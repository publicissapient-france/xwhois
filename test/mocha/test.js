var assert = require("assert"),
    http = require("http"),
    trombinoscopeDb = require('../../src/api/infrastructure/trombinoscopeDb');

describe('API Test', function () {
    var server, devMode;

    before(function (done) {
        devMode = process.env.DEVMODE;
        process.env.DEVMODE = true;
        app = require("../../server");
        server = app.listen(8081);
        done();
    });

    after(function (done) {
        if (server !== undefined) {
            server.close();
        }
        if (devMode === undefined) {
            delete process.env.DEVMODE;
        } else {
            process.env.DEVMODE = devMode;
        }
        trombinoscopeDb.reset();
        done();
    });

    it('should return 200 and a message', function (done) {
        var url = 'http://localhost:8081/index.html',
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
        var url = 'http://localhost:8081/api/challenge',
            challenge = http.get(url, function (res) {
            assert.equal(200, res.statusCode);
            var data = '';
            res.on('data', function (chunk) {
                data += chunk;
            });

            res.on('end', function () {
                var jsonData = JSON.parse(data);
                assert.ok(jsonData.firstImage !== jsonData.secondImage, 'first image should be different than second image');
                var firstMatch = jsonData.firstImage.match('/assets/images/xebians/(Sébastian Le Merdy|Antoine Michaud)');
                assert.notStrictEqual(firstMatch, null);
                var secondMatch = jsonData.secondImage.match('/assets/images/xebians/(Sébastian Le Merdy|Antoine Michaud)');
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
            port: 8081,
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
            port: 8081,
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
            'Content-Type': 'application/json',
        };
        var options = {
            host: 'localhost',
            port: 8081,
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
});
