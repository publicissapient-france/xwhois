var assert = require("assert");
var hippie = require('hippie');

var server;
var handler;

before(function (done) {
    process.env.NOLISTEN = true;
    process.env.TESTDB = true;
    server = require('../../server.js');
    handler = server.listen(9090, function () {
        done();
    });
});

after(function () {
    process.exit(0);
});

describe('Server', function () {
    describe('/api/challenge endpoint', function () {
        it('should get challenge', function (done) {
            hippie(server)
                .json()
                .get('/api/challenge')
                .expectStatus(200)
                .end(function (err, res, body) {
                    assert(res);
                    assert(body);
                    if (err) throw err;
                    done();
                });
        });
    });
});
