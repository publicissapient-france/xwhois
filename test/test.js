var assert = require("assert");
var server = require("../server");
var http = require("http");


describe('Array', function(){
    
    before(function () {
        server.listen(8080);
    });
    
    
    describe('#indexOf()', function () {
        it('should get first question', function (done) {
            http.get('http://localhost:8080', function (res) {
                assert.equal(200, res.statusCode);
                var data = "";
                res.on('data', function (chunk) {
                    data +=  chunk;
                });
                res.on('end', function () {
                    assert.equal("{ firstQuestion: 'oui'}", data);
                    done();
                });
            });
        });
    });
    
    after(function () {
        server.close();
    })
});
