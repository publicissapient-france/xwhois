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
                assert.ok(jsonData.answer.search('[first|second]Image') !== -1);
                done();
            });
        });
    });

});
