var Promise = require('bluebird'),
    mongoose = require('mongoose');

ChallengeDb = mongoose.model('challenge', {
    playerName: {type: String, index: true},
    challengeName: {type: String},
    score: Number,
    date: Date
});

module.exports = {
    'reset': function () {
        return new Promise(function (resolve, reject) {
            ChallengeDb.remove({})
                .then(function () {
                    resolve();
                })
                .catch(reject);
        });
    },
    'getChallengesByName': function (name) {
        return new Promise(function (resolve, reject) {
            ChallengeDb.find({playerName: name}, function (error, challenges) {
                if (error) {
                    reject(challenges + 'was not found');
                    return;
                }
                if (challenges === null) {
                    resolve();
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
                resolve(extractedChallenge);
            });
        });
    },

    'saveChallenge': function (playerName, challenge, score) {
        return new Promise(function (resolve, reject) {
            new ChallengeDb({ playerName: playerName, challengeName: challenge.name, score: score, date: new Date() }).save()
                .then(function (challenge) {
                    resolve(challenge);
                })
                .catch(function (error) {
                    reject(error);
                });
        });
    }
};
