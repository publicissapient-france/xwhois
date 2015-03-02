var assert = require("assert");
var server = require("../server");
var http = require("http");


describe('API Test', function () {
    it('should return 200 and a message', function (done) {
        http.get('http://localhost:8080', function (res) {
            assert.equal(200, res.statusCode);
            var data = "";
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                assert.equal("Salut tout le monde !", data);
                done();
            });
        });
    });

    it('should get a challenge', function (done) {
        http.get('http://localhost:8080/api/challenge', function (res) {
            assert.equal(200, res.statusCode);
            var data = '';
            res.on('data', function (chunk) {
                data += chunk;
            });

            res.on('end', function () {
                var jsonData = JSON.parse(data);
                assert.equal("/images/Sebastian Le Merdy.jpg", jsonData.firstImage);
                assert.equal("/images/Antoine Michaud.jpg", jsonData.secondImage);
                assert.equal("Sébastian Le Merdy", jsonData.name);
                assert.equal("firstImage", jsonData.answer);
                done();
            });
        });
    });
});
