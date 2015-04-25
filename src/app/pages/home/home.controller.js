'use strict';

angular.module('app.xwhois')
    .controller('HomeController', function ($navigation, $scope) {
        $navigation.leavingHome = false;

        $scope.connected = false;

        $scope.signin = function() {
            $scope.connected = true;
        };
    });
