'use strict';

angular.module('app.xwhois',
    [
        'app.conf',
        'app.templates',
        'ngRoute', 'route-segment', 'view-segment', 'oauth'
    ])

    .config(["$routeProvider", "$routeSegmentProvider", "$locationProvider", function ($routeProvider, $routeSegmentProvider, $locationProvider) {

        $routeSegmentProvider.options.autoLoadTemplates = true;
        $routeProvider.otherwise({redirectTo: '/'});
        $locationProvider.html5Mode({enabled: true, requireBase: false}).hashPrefix('!');

    }])

    .run(["$log", "$rootScope", "mode", function ($log, $rootScope, mode) {

        $log.info('env:', mode);
        $rootScope.env = mode;

    }]);

'use strict';

angular.module('app.xwhois')

    .provider('$routes', ["$routeSegmentProvider", "routes", function ($routeSegmentProvider, routes) {

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

    }]);

'use strict';

angular.module('app.xwhois')
    .factory('$navigation', ["$rootScope", "$location", "$timeout", "$routeSegment", function ($rootScope, $location, $timeout, $routeSegment) {

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

    }])

    .run(["$navigation", "$rootScope", function ($navigation, $rootScope) {
        $rootScope.$navigation = $navigation;
    }]);

'use strict';

angular.module('app.xwhois')
    .filter('normalize', function () {
        return function (input) {
            // apply toLowerCase() function
            input = input.toLowerCase();
            // specified letters for replace
            var from = 'àáäâèéëêěìíïîòóöôùúüûñçčřšýžďť';
            var to = 'aaaaeeeeeiiiioooouuuunccrsyzdt';
            // replace each special letter
            for (var i = 0; i < from.length; i++) {
                input = input.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
            }
            // return normalized string
            return input;
        };
    });

'use strict';

angular.module('app.xwhois')
    .directive('xp', function () {

        return {
            templateUrl: 'components/xp/xp.html',
            controller: ["$scope", function($scope) {
                $scope.percent = 0;
                $scope.$watch('value', function(value) {
                    $scope.percent = (value / $scope.nextLevel) * 100;
                });
            }],
            restrict: 'EA',
            scope: {
                value: '=',
                nextLevel: '='
            }
        };

    });

'use strict';

angular.module('app.xwhois')
    .controller('HomeController', ["$navigation", "$scope", "AccessToken", function ($navigation, $scope, AccessToken) {
        $navigation.leavingHome = false;

        $scope.loggedIn = function () {
            return !!AccessToken.get();
        };
    }]);

'use strict';

angular.module('app.xwhois')
    .controller('MatchController', ["$rootScope", "$scope", "$location", "$timeout", "$match", "$navigation", function ($rootScope, $scope, $location, $timeout, $match, $navigation) {

        $scope.question = null;
        $scope.modal = false;
        $scope.totalTry = 0;
        $scope.score = 0;

        function nextImage() {
            $match.nextChallenge().then(function(question) {
                $scope.result = null;
                $scope.question = question;
            });
        }

        $scope.giveUp = function () {
            $scope.modal = false;
            $match.kill();
            $navigation.to('home', 600);
        };

        $scope.openModal = function() {
            $scope.modal = true;
        };

        $scope.closeModal = function() {
            $scope.modal = false;
        };

        $scope.chooseImage = function(chosedImage, name) {
            if ($scope.result !== null) {
                return;
            }
            $match.tryToAnswer(chosedImage, name).then(function (result) {
                $scope.result = result;
                $timeout(function() {
                    nextImage();
                }, 2000);
            });
        };

        $match.start();

        nextImage();

    }]);

'use strict';

angular.module('app.xwhois')
    .factory('$match', ["$rootScope", "$location", "$http", "$log", "api", function ($rootScope, $location, $http, $log, api) {

        var currentChallenge = null;
        var currentMatch = null;
        var results = [
            {score: 10, totalTry: 15, comment: 'You\'re Fired'},
            {score: 20, totalTry: 21, comment: 'Could be Better'}
        ];

        function startMatch() {
            if ($rootScope.playing) {
                $log.warn('game alreay running');
                return;
            }
            currentMatch = {
                score: 0, totalTry: 0
            };
            $rootScope.playing = true;
        }

        function killMatch() {
            if (!$rootScope.playing) {
                $log.warn('game is not running');
                return;
            }
            currentMatch.comment = '-'; // TODO randomize this
            results[0] = currentMatch;
            currentMatch = null;
            $rootScope.playing = false;
        }

        function nextChallenge() {
            return $http.get(api.challenge.get).then(function (challenge) {
                return (currentChallenge = challenge.data);
            }, function () {
                $log.warn('something goes wrong on the server');
            });
        }

        function tryToAnswer(imageChoosed, name) {
            currentMatch.totalTry++;
            // put this code on the server to protect game
            var answer = {
                name: name,
                image: imageChoosed
            };
            return $http.post(api.challenge.post, answer).then(function (response) {
                if (response.data.result === true) {
                    currentMatch.score++;
                    return true;
                }
                return false;
            }, function () {
                $log.warn('something goes wrong on the server');
            });
        }

        return {
            start: startMatch,
            kill: killMatch,
            current: function () {
                return angular.copy(currentMatch);
            },
            nextChallenge: nextChallenge,
            tryToAnswer: tryToAnswer,
            results: results
        };

    }])

    .run(["$match", "$rootScope", function ($match, $rootScope) {
        $rootScope.$match = $match;
    }]);

'use strict';

angular.module('app.xwhois')
    .directive('loader', function () {

        return {
            templateUrl: 'components/loading/loader/loader.html',
            controller: ["$scope", "$interval", function($scope, $interval) {
                if (angular.isUndefined($scope.loading)) {
                    $scope.loading = true;
                }

                var clearInterval = false;
                var step = 10;
                $scope.percent = 0;

                $scope.$watch('loading', function(loading) {
                    if (loading) {
                        clearInterval = $interval(function() {
                            if (($scope.percent += step) === 100 || $scope.percent === 0) {
                                step = -step;
                            }
                        }, 100);
                    } else if (clearInterval) {
                        $interval.cancel(clearInterval);
                        clearInterval = false;
                    }
                });

            }],
            restrict: 'E',
            scope: {
                loading: '=?'
            }
        };

    });
