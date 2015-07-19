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

angular.module('app.conf', [])
.constant('mode', "development")
.constant('api', {"challenge":{"get":"/api/challenge","post":"/api/challenge/answer"}})
.constant('routes', {"home":{"default":true,"url":"/","templateUrl":"home/home.html","controller":"HomeController"},"match":{"default":true,"url":"/play","templateUrl":"match/match.html","controller":"MatchController"},"credits":{"default":true,"url":"/credits","templateUrl":"credits.html"},"error":{"url":"/error","templateUrl":"error/error.html","./":{"err404":{"default":true,"url":"/404","templateUrl":"error/error-404.html","controller":"HomeController"}}}});

angular.module("app.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("credits.html","\n<h1>Credits</h1>\n<hr/>\n<h2>Music</h2><a href=\"http://grayscale.scene.pl/msx_archive.php?lang=en\">Grayscale archives</a>\n<h2>Graphics</h2><a href=\"http://www.ux-republic.com/\">UX Republic</a>\n<h2>Developpers</h2><a href=\"http://www.xebia.fr/\">XebiaFr</a>\n<hr/><a href=\"#{{ \'home\' | routeSegmentUrl }}\">&lt; Back</a>");
$templateCache.put("error/error-404.html","\n<p>Not found</p>");
$templateCache.put("error/error.html","\n<p>An error occured !!!</p>\n<div app-view-segment=\"1\"></div>");
$templateCache.put("home/home.html","\n<div ng-class=\"{\'slide-out\': $navigation.leaving}\" class=\"splash-screen\">\n  <div id=\"logo\"></div>\n  <div class=\"slogan\">Le jeu des petits bonshommes violets</div>\n  <div ng-show=\"loggedIn()\">\n    <div class=\"informations\">\n      <div class=\"avatar\"><img src=\"https://fr.gravatar.com/userimage/80232426/a5e97654a15843fa94bc523e14f0525e.jpeg\"/></div>\n      <div xp=\"xp\" next-level=\"30\" value=\"12\" class=\"exp\"></div>\n      <div class=\"scores\">\n        <div class=\"me\">\n          <div style=\"float: left;\">Level 1</div>\n          <div style=\"float: right;\">M. Boule Qui-est-ce</div>\n          <div style=\"clear: both\"></div>\n        </div>\n        <table>\n          <tr ng-repeat=\"match in $match.results\">\n            <td>{{ $first ? \'Last score\' : \'Best score\' }}</td>\n            <td>{{ match.score }}/{{ match.totalTry }}</td>\n            <td>{{ match.comment }}</td>\n          </tr>\n        </table>\n      </div>\n    </div>\n    <div id=\"play\"><a href=\"\" ng-click=\"$navigation.to(\'match\', 600)\">PLAY</a></div>\n  </div>\n  <div id=\"signin\">\n    <!-- See https://doorkeeper-provider.herokuapp.com/oauth/applications/252-->\n    <oauth site=\"https://accounts.google.com/o\" authorize-path=\"/oauth2/auth?hd=xebia.fr\" client-id=\"13229706518-7q72jrhasf3lhprslqaiejg716arcivf.apps.googleusercontent.com\" redirect-uri=\"http://localhost:8081\" scope=\"profile\" template=\"/assets/templates/oauth-template.html\">SIGN IN</oauth>\n  </div>\n</div>\n<footer ng-class=\"{\'slide-out\': $navigation.leaving}\" class=\"footer\">\n  <ul>\n    <li>&copy; 2015 -&nbsp;<a href=\"\" ng-click=\"$navigation.to(\'credits\', 600)\">Credits</a>&nbsp;-&nbsp;<a href=\"http://xebia.fr\">Xebia</a></li>\n  </ul>\n</footer>\n<audio ng-if=\"env == \'production\'\" autoplay=\"autoplay\" loop=\"loop\" src=\"http://grayscale.scene.pl/msx/synthy_g.mp3\"></audio>");
$templateCache.put("match/match.html","\n<div ng-class=\"{\'slide-out\': $navigation.leaving}\" class=\"header\">\n  <ul>\n    <li>{{ $match.current().score }} / {{ $match.current().totalTry }}</li>\n    <li>\n      <loader loading=\"result === null\"></loader>\n    </li>\n    <li><a href=\"\" ng-click=\"openModal()\">Surrend</a></li>\n  </ul>\n</div>\n<div ng-if=\"modal\" class=\"leave\">\n  <div class=\"leave-modal\">Are you sure ?<a href=\"\" ng-click=\"giveUp()\">Yes</a>&nbsp;/&nbsp;<a href=\"\" ng-click=\"closeModal()\">No</a></div>\n</div>\n<div ng-class=\"{\'slide-out\': $navigation.leaving}\" class=\"game\">\n  <div ng-if=\"question\">\n    <div class=\"game-area firstImage\"><span ng-click=\"chooseImage(question.firstImage, question.name)\"><img ng-if=\"question.firstImage\" ng-src=\"{{ question.firstImage }}\"/></span></div>\n    <div class=\"game-area secondImage\"><span ng-click=\"chooseImage(question.secondImage, question.name)\"><img ng-if=\"question.secondImage\" ng-src=\"{{ question.secondImage }}\"/></span></div>\n    <div class=\"who-am-i\"><span ng-if=\"result === null\">Who is \"{{ question.name | normalize }}\" ?</span><span ng-if=\"result !== null\" ng-style=\"{color: result ? \'green\': \'red\'}\">{{ result ? \"CORRECT !\" : \"WRONG !\" }}</span></div>\n  </div>\n</div>\n<audio ng-if=\"env == \'production\'\" autoplay=\"autoplay\" loop=\"loop\" src=\"http://grayscale.scene.pl/msx/404error.mp3\"></audio>");
$templateCache.put("index.html","<!DOCTYPE html>\n<html ng-app=\"app.xwhois\">\n  <head>\n    <title>XWhois</title>\n    <meta name=\"description\" content=\"XWhois\">\n    <meta charset=\"utf-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <link rel=\"icon\" href=\"favicon.ico\">\n    <link href=\"styles.css\" rel=\"stylesheet\" type=\"text/css\">\n    <script type=\"text/javascript\" src=\"libs/vendors.js\"></script>\n    <script type=\"text/javascript\" src=\"app.final.js\"></script>\n  </head>\n  <body ng-class=\"{\'slide-out\': $navigation.leavingHome}\">\n    <section app-view-segment=\"0\" class=\"container\"></section>\n  </body>\n</html>");
$templateCache.put("components/loading/loading.html","\n<p>Loading...</p>");
$templateCache.put("components/xp/xp.html","\n<div class=\"xp\">\n  <div class=\"xp-values\">\n    <div style=\"float: left;\">{{ value }}&nbsp;/&nbsp;{{ nextLevel }}</div>\n    <div style=\"float: right;\">xp</div>\n  </div>\n  <div ng-style=\"{\'width\': percent + \'%\'}\" class=\"xp-bar\"></div>\n</div>");
$templateCache.put("components/loading/loader/loader.html","\n<div class=\"loader\">\n  <div ng-style=\"{\'margin-left\': (percent * 1.5) + \'px\'}\" class=\"loader-tag\"></div>\n</div>");}]);