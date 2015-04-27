'use strict';

angular.module('app.xwhois',
    [
        'app.conf',
        'app.templates',
        'ngRoute', 'route-segment', 'view-segment', 'oauth'
    ])

    .config(function ($routeProvider, $routeSegmentProvider, $locationProvider) {

        $routeSegmentProvider.options.autoLoadTemplates = true;
        $routeProvider.otherwise({redirectTo: '/'});
        $locationProvider.html5Mode({enabled: true, requireBase: false}).hashPrefix('!');

    })

    .run(function ($log, $rootScope, mode) {

        $log.info('env:', mode);
        $rootScope.env = mode;

    });
