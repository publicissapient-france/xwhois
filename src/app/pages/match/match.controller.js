'use strict';

angular.module('app.xwhois')
    .controller('MatchController', function ($rootScope, $scope, $location, $timeout, $match) {

        var statusBar = angular.element(document.querySelector('.header'));

        $scope.giveUp = function() {
            $rootScope.stopping = true;
            $match.kill();
            statusBar.addClass('slide-out');
            $timeout(function() {
                $location.path('/');
            }, 600);
        };

        $timeout(function() {
            $match.start();
        });

        $rootScope.stopping = false;
        $rootScope.starting = true;

    });
