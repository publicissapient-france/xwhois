'use strict';

angular.module('app.xwhois')
    .controller('MatchController', function ($rootScope, $scope, $location, $timeout, $match) {

        var statusBar = angular.element(document.querySelector('.header'));

        $scope.question = null;
        $scope.modal = false;

        function nextImage() {
            $match.nextChallenge().then(function(question) {
                $scope.result = null;
                $scope.question = question;
            });
        }

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

        $scope.chooseImage = function(answer) {
            if ($scope.result !== null) {
                return;
            }
            $scope.result = $match.tryToAnswer(answer);
            $timeout(function() {
                nextImage();
            }, 2000);
        };

        $match.start();

        nextImage();

        $rootScope.stopping = false;
        $rootScope.starting = true;

    });
