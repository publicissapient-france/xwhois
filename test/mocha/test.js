var assert = require("assert");
require("../../server");
var http = require("http");

describe('API Test', function () {

    it('should return 200 and a message', function (done) {
        http.get('http://localhost:8081/index.html', function (res) {
            assert.equal(200, res.statusCode);
            var data = "";
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                assert(data.indexOf("XWhois") >= 0);
                done();
            });
        });
    });

    it('should get a challenge', function (done) {
        http.get('http://localhost:8081/api/challenge', function (res) {
            assert.equal(200, res.statusCode);
            var data = '';
            res.on('data', function (chunk) {
                data += chunk;
            });

            res.on('end', function () {
                var jsonData = JSON.parse(data);
                assert.ok(jsonData.firstImage.search('/assets/images/xebians/Firstname[1|2] Lastname[1|2]') !== -1);
                assert.ok(jsonData.secondImage.search('/assets/images/xebians/Firstname[1|2] Lastname[1|2]') !== -1);
                assert.ok(jsonData.name.search('Firstname[1|2] Lastname[1|2]') !== -1);
                done();
            });
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
        req.end();
    });
});
