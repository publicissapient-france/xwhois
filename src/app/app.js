'use strict';

angular.module('app.xwhois',
    [
        'app.conf',
        'app.templates',
        'ngRoute', 'route-segment', 'view-segment'
    ])

    .config(function ($routeProvider, $routeSegmentProvider) {

        $routeSegmentProvider.options.autoLoadTemplates = true;
        $routeProvider.otherwise({redirectTo: '/'});

    })

    .run(function ($log, mode) {

        $log.info('env:', mode);

    });
