'use strict';

angular.module('app.xwhois')
    .controller('MatchController', function ($rootScope, $scope, $location, $timeout, $match) {

        var statusBar = angular.element(document.querySelector('.header'));

        $scope.giveUp = function() {
            $match.kill();
            statusBar.addClass('slide-out');
            $timeout(function() {
                $location.path('/');
            }, 600);
        };

        $timeout(function() {
            $match.start();
        });

    });
