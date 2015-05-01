'use strict';

angular.module('app.xwhois')
    .controller('HomeController', function ($navigation, $scope, $timeout, AccessToken) {
        $navigation.leavingHome = false;

        $timeout(function() {
            $scope.logged = !!AccessToken.get();
        }, 0);
    });
