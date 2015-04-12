'use strict';

angular.module('app.xwhois')
    .factory('$match', function ($rootScope, $location, $http, $log, api) {

        var currentChallenge = null;
        var currentMatch = null;
        var results = [
            {score: 10, totalTry: 15, comment: 'You\'re Fired'},
            {score: 20, totalTry: 21, comment: 'Could be Better'}
        ];

        function startMatch() {
            if ($rootScope.playing) {
                $log.warn('game alreay running');
                return;
            }
            currentMatch = {
                score: 0, totalTry: 0
            };
            $rootScope.playing = true;
        }

        function killMatch() {
            if (!$rootScope.playing) {
                $log.warn('game is not running');
                return;
            }
            currentMatch.comment = '-'; // TODO randomize this
            results[0] = currentMatch;
            currentMatch = null;
            $rootScope.playing = false;
        }

        function nextChallenge() {
            return $http.get(api.challenge.get).then(function (challenge) {
                return (currentChallenge = challenge.data);
            }, function () {
                $log.warn('something goes wrong on the server');
            });
        }

        function tryToAnswer(imageChoosed, name) {
            currentMatch.totalTry++;
            // put this code on the server to protect game
            var answer = {
                name: name,
                image: imageChoosed
            };
            return $http.post(api.challenge.post, answer).then(function (response) {
                if (response.data.result === true) {
                    currentMatch.score++;
                    return true;
                }
                return false;
            }, function () {
                $log.warn('something goes wrong on the server');
            });
        }

        return {
            start: startMatch,
            kill: killMatch,
            current: function () {
                return angular.copy(currentMatch);
            },
            nextChallenge: nextChallenge,
            tryToAnswer: tryToAnswer,
            results: results
        };

    })

    .run(function ($match, $rootScope) {
        $rootScope.$match = $match;
    });
