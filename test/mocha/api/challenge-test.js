var assert = require("assert"),
    trombinoscopeDb = require('../../../src/api/infrastructure/trombinoscopeDb'),
    challengeModule = require("../../../src/api/challenge");

describe("Challenge Module Test", function () {
    var previousPeople;

    beforeEach(function (done) {
        previousPeople = trombinoscopeDb.people;
        trombinoscopeDb.people = [
            {'name': 'Firstname1 Lastname1'},
            {'name': 'Firstname2 Lastname2'}
        ];
        done();
    });

    afterEach(function (done) {
        trombinoscopeDb.people = previousPeople;
        done();
    });

    it('should create a challenge', function () {
        var challenge = challengeModule('/assets/images/xebians').createChallenge();

        assert(challenge.firstImage.search('/assets/images/xebians/Firstname[1|2] Lastname[1|2]') !== -1);
        assert(challenge.secondImage.search('/assets/images/xebians/Firstname[1|2] Lastname[1|2]') !== -1);
        assert(challenge.name.search('Firstname[1|2] Lastname[1|2]') !== -1);
    });
});
