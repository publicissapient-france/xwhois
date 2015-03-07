'use strict';

angular.module('app.xwhois')
    .controller('MatchController', function ($rootScope, $scope, $location, $timeout, $match) {

        var statusBar = angular.element(document.querySelector('.header'));

        $scope.question = null;
        $scope.modal = false;

        $scope.giveUp = function () {
            $scope.modal = false;
            $rootScope.stopping = true;
            $match.kill();
            statusBar.addClass('slide-out');
            $timeout(function () {
                $location.path('/');
            }, 600);
        };

        $scope.openModal = function() {
            $scope.modal = true;
        };

        $scope.closeModal = function() {
            $scope.modal = false;
        };

        $match.start();

        $match.nextChallenge().then(function(question) {
            console.log(question);
            $scope.question = question;
        });

        $rootScope.stopping = false;
        $rootScope.starting = true;

    });
