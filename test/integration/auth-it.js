var assert = require("assert");

var server;
var handler;
var supertest = require('supertest');

before(function (done) {
    process.env.NOLISTEN = true;
    process.env.TESTDB = true;
    server = require('../../server.js');
    handler = server.listen(9090, function () {
        done();
    });
});

after(function () {
    handler.close();
});

describe('Server', function () {
    describe('/api/challenge endpoint', function () {
        it('should get challenge', function (done) {
            supertest('http://localhost:9090')
                .get('/api/challenge')
                .expect(200)
                .end(function (err, res) {
                    assert(res);
                    if (err) throw err;
                    done();
                });
        });
    });
});
