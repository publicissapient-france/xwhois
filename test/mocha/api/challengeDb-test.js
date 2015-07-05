var assert = require('assert'),
    challengeDb = require('../../../src/api/infrastructure/challengeDb'),
    trombinoscopeDb = require('../../../src/api/infrastructure/trombinoscopeDb'),
    Q = require('q');

describe('Challenge Db Module', function () {
    beforeEach(function (done) {
        trombinoscopeDb.connect()
            .then(function () {
                return trombinoscopeDb.reset();
            })
            .then(done)
            .fail(function (error) {
                done(new Error(error));
            });
    });

    afterEach(function (done) {
        trombinoscopeDb.close()
            .then(done)
            .fail(function (error) {
                done(new Error(error));
            })
    });

    it('should save a challenge', function (done) {
        // given
        var challenge = {
            'name': 'Pretty Bear',
            'image': new Buffer('def')
        };
        challengeDb.saveChallenge("name", challenge, 1)
            .then(function () {
                // then
                return challengeDb.getChallengesByName("name").then(function(challenges) {
                        assert.equal(challenges[0].name, 'name');
                        assert.equal(challenges[0].challengeName, challenge.name);
                        assert.equal(challenges[0].score, 1);
                        assert.notNull(challenges[0].date);
                });
            })
            .then(function () {
                done();
            })
            .fail(done);
    });
});
