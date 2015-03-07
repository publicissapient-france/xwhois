'use strict';

angular.module('app.xwhois')
    .controller('MatchController', function ($rootScope, $scope, $location, $timeout, $match) {

        var statusBar = angular.element(document.querySelector('.header'));

        $scope.question = null;

        $scope.giveUp = function () {
            $rootScope.stopping = true;
            $match.kill();
            statusBar.addClass('slide-out');
            $timeout(function () {
                $location.path('/');
            }, 600);
        };

        $match.start();

        $match.nextChallenge().then(function(question) {
            console.log(question);
            $scope.question = question;
        });

        $rootScope.stopping = false;
        $rootScope.starting = true;

    });
