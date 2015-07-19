angular.module('app.conf', [])
.constant('mode', "development")
.constant('api', {"challenge":{"get":"/api/challenge","post":"/api/challenge/answer"}})
.constant('routes', {"home":{"default":true,"url":"/","templateUrl":"home/home.html","controller":"HomeController"},"match":{"default":true,"url":"/play","templateUrl":"match/match.html","controller":"MatchController"},"credits":{"default":true,"url":"/credits","templateUrl":"credits.html"},"error":{"url":"/error","templateUrl":"error/error.html","./":{"err404":{"default":true,"url":"/404","templateUrl":"error/error-404.html","controller":"HomeController"}}}});
