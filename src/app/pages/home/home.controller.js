'use strict';

angular.module('app.xwhois')
    .controller('HomeController', function ($navigation, $scope, $window, $routeParams) {
        $navigation.leavingHome = false;

        $scope.accessToken = $routeParams.authToken;

        // TODO read access token from url
        $scope.loggedIn = function () {
            return !!$scope.accessToken;
        };

        $scope.login = function () {
            $window.location.href = 'http://localhost:8081/auth/google';
        }
    });
