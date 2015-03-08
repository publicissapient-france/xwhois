'use strict';

angular.module('app.xwhois')
    .factory('$navigation', function ($rootScope, $location, $timeout, $routeSegment) {

        var navigation = {
            to: function to(route, time) {
                navigation.leavingHome = (route !== 'home');
                navigation.leaving = true;
                $timeout(function () {
                    $location.path($routeSegment.getSegmentUrl(route));
                    navigation.leaving = false;
                }, time);
            },
            leaving: false,
            leavingHome: true
        };

        return navigation;

    })

    .run(function ($navigation, $rootScope) {
        $rootScope.$navigation = $navigation;
    });
