'use strict';

angular.module('app.xwhois')
    .factory('$match', function ($rootScope, $location, $log) {

        function startMatch() {
            if ($rootScope.playing) {
                $log.warn('game alreay running');
                return;
            }
            $rootScope.playing = true;
        }

        function killMatch() {
            if (!$rootScope.playing) {
                $log.warn('game is not running');
                return;
            }
            $rootScope.playing = false;
        }

        return {
            start: startMatch,
            kill : killMatch
        };

    });
