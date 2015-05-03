'use strict';

angular.module('app.xwhois')
    .controller('HomeController', function ($navigation, $scope, AccessToken) {
        $navigation.leavingHome = false;

        $scope.loggedIn = function () {
            return !!AccessToken.get();
        };
    });
