var assert = require("assert");
var hippie = require('hippie');

var server = require('../../../server.js');

describe('Server', function () {
    describe('/api/challenge endpoint', function () {
        it('should get challenge', function (done) {
            hippie(server)
                .json()
                .get('/api/challenge')
                .expectStatus(200)
                .end(function (err, res, body) {
                    assert(true);
                    assert(res);
                    assert(body);
                    if (err) throw err;
                    done();
                });
        });
    });
});
