'use strict';

angular.module('app.xwhois')
    .controller('HomeController', function ($rootScope, $scope, $location, $timeout) {

        $scope.play = function() {
            $rootScope.starting = true;
            $timeout(function() {
                $location.path('/play');
            }, 800);
        };

        $rootScope.starting = false;

    });
