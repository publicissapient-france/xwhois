'use strict';

angular.module('app.xwhois')

    .provider('$routes', function ($routeSegmentProvider, routes) {

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

        console.info('routes: init');

        function walkRoutes(_routes, parent, parentsUrl, parentsId) {
            rootDeep++;
            _.each(_routes, function (route, routeName) {
                var routeId = !!parentsId ? parentsId + '.' + routeName : routeName;
                var routeUrl = !!parentsUrl ? parentsUrl + route.url : route.url;
                console.info(_.times(rootDeep, function () {
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

        this.$get = function() {
            return routes;
        };

    });
