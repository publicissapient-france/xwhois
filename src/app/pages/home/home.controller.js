'use strict';

angular.module('app.xwhois')
    .controller('HomeController', function ($navigation) {
        $navigation.leavingHome = false;
    });
