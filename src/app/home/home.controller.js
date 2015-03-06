'use strict';

angular.module('app.xwhois')
    .controller('HomeController', function ($rootScope, $scope, $log, mode) {

        $log.info('env: ', mode);

        $scope.play = function() {
            $rootScope.playing = true;
        };

    });
