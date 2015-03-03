var assert = require("assert");
var challengeModule = require("../../../src/api/challenge");

describe("Challenge Module Test", function () {
    it('should create a challenge', function () {
        var challenge = challengeModule.createChallenge().reinit().createChallenge();

        assert.equal(challenge.firstImage, "/images/Sebastian Le Merdy.jpg");
        assert.equal(challenge.secondImage, "/images/Antoine Michaud.jpg");
        assert.equal(challenge.name, "Sébastian Le Merdy");
        assert.equal(challenge.answer, "firstImage");
    });

    it('should have two different challenges', function () {
        var challenge = challengeModule.createChallenge().reinit();
        var challenge1 = challenge.createChallenge();
        var challenge2 = challenge.createChallenge();

        assert.notDeepEqual(challenge2, challenge1);
    });
});
