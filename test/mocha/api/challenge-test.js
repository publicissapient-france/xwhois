var assert = require("assert");
var challengeModule = require("../../../src/api/challenge");

describe("Challenge Module Test", function () {
    it('should create a challenge', function () {
        var challenge = challengeModule('./test/assets/images/xebians', '/assets/images/xebians').createChallenge();

        assert.equal(challenge.firstImage, "/assets/images/xebians/Sebastian Le Merdy.jpg");
        assert.equal(challenge.secondImage, "/assets/images/xebians/Antoine Michaud.jpg");
        assert.equal(challenge.name, "Sébastian Le Merdy");
        assert.equal(challenge.answer, "firstImage");
    });

    it('should have two different challenges', function () {
        var challenge = challengeModule('./test/assets/images/xebians', '/assets/images/xebians');
        var challenge1 = challenge.createChallenge();
        var challenge2 = challenge.createChallenge();

        assert.notDeepEqual(challenge2, challenge1);
    });
});
