var Q = require('q'),
    mongoose = require('mongoose');

ChallengeDb = mongoose.model('challenge', {
    playerName: {type: String, index: true},
    challengeName: {type: String},
    score: Number,
    date: Date
});

module.exports = {
    'reset': function () {
        var deferred = Q.defer();
        ChallengeDb.remove({})
            .then(function () {
                deferred.fulfill();
            });
        return deferred.promise;
    },
    'getChallengesByName': function (name) {
        var deferred = Q.defer();
        ChallengeDb.find({playerName: name}, function (error, challenges) {
            if (error) {
                deferred.reject(challenges + 'was not found');
                return;
            }
            if (challenges === null) {
                deferred.fulfill();
                return;
            }
            var extractedChallenge = [];
            for (var i = 0; i < challenges.length; i++) {
                extractedChallenge.push({
                    'playerName': challenges[i].get('playerName'),
                    'challengeName': challenges[i].get('challengeName'),
                    'score': challenges[i].get('score'),
                    'date': challenges[i].get('date')
                });
            }
            deferred.fulfill(extractedChallenge);
        });
        return deferred.promise;
    },

    'saveChallenge': function (playerName, challenge, score) {
        var deferred = Q.defer();
        new ChallengeDb({playerName: playerName, challengeName: challenge.name, score: score, date: new Date()}).save()
            .then(function (challenge) {
                deferred.fulfill(challenge);
            })
            .onReject(function (error) {
                deferred.reject(error);
            });
        return deferred.promise;
    }
};
