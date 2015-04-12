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
        var challenge = challengeModule.createChallenge('/assets/images/xebians');

        assert(challenge.firstImage.search('/assets/images/xebians/Firstname[1|2] Lastname[1|2]') !== -1, 'first image is in form /assets/images/xebians/Firstname[1|2] Lastname[1|2]');
        assert(challenge.secondImage.search('/assets/images/xebians/Firstname[1|2] Lastname[1|2]') !== -1, 'second image is in form /assets/images/xebians/Firstname[1|2] Lastname[1|2]');
        assert(challenge.name.search('Firstname[1|2] Lastname[1|2]') !== -1, 'name is in form Firstname[1|2] Lastname[1|2]');
    });

    it('should valid a winning answer', function () {
        var answer = {image: '/assets/images/xebians/Firstname1 Lastname1', name: 'Firstname1 Lastname1' };
        var result = challengeModule.validAnswer(answer);

        assert(result === true, 'The answer should be a winning one');
    });

    it('should valid a losing answer', function () {
        var answer = {image: '/assets/images/xebians/Firstname1 Lastname1', name: 'Firstname2 Lastname2' };
        var result = challengeModule.validAnswer(answer);

        assert(result === false, 'The answer should be a losing one');
    });
});
