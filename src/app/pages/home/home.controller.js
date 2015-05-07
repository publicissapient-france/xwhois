'use strict';

angular.module('app.xwhois')
    .controller('HomeController', function ($navigation, $scope, AccessToken) {
        $navigation.leavingHome = false;

        $scope.loggedIn = function () {
            return !!AccessToken.get();
        };

        // TODO: on login, ask backend to store the auth token
        // TODO: on logout, ask backend to remove the auth token
    });
