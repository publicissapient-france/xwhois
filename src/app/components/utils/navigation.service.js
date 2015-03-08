'use strict';

angular.module('app.xwhois')
    .factory('$navigation', function ($rootScope, $location, $timeout, $routeSegment) {

        var navigation = {
            to: function to(route, time) {
                navigation.leaving = true;
                $timeout(function () {
                    $location.path($routeSegment.getSegmentUrl(route));
                    navigation.leaving = false;
                }, time);
            },
            leaving: false
        };

        return navigation;

    })

    .run(function ($navigation, $rootScope) {
        $rootScope.$navigation = $navigation;
    });
