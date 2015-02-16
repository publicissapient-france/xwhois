'use strict';

angular.module('app.xwhois',
    [
        'app.conf',
        'app.templates',
        'ngRoute', 'route-segment', 'view-segment'
    ])

    .config(function ($routeProvider, $routeSegmentProvider, routes) {

        $routeSegmentProvider.options.autoLoadTemplates = true;
        $routeProvider.otherwise({redirectTo: '/'});

        // additionnal states found in routes configuration file
        var rootDeep = -1;
        var defaultRoutesDatas = {
            untilResolved: {
                templateUrl: 'components/loading/loading.html'
            },
            resolveFailed: {
                templateUrl: 'error/error.html',
                controller: 'HomeController'
            }
        };

        function walkRoutes(_routes, parent, parentsUrl, parentsId) {
            rootDeep++;
            _.each(_routes, function (route, routeName) {
                var routeId = !!parentsId ? parentsId + '.' + routeName : routeName;
                var routeUrl = !!parentsUrl ? parentsUrl + route.url : route.url;
                console.log(_.times(rootDeep, function () {
                    return ' ';
                }).join('') + routeName + '[' + routeId + '] : ' + routeUrl);
                $routeSegmentProvider.when(routeUrl, routeId);
                route = _.extend(route, defaultRoutesDatas);
                parent.segment(routeName, route);
                if (!!route['./']) {
                    walkRoutes(route['./'], parent.within(routeName), routeUrl, routeName);
                }
            }, $routeSegmentProvider);
            rootDeep--;
        }

        walkRoutes(routes, $routeSegmentProvider);

    })

    .run(function () {

    });
