'use strict';

angular.module('app.xwhois')
    .directive('xp', function () {

        return {
            templateUrl: 'components/xp/xp.html',
            controller: function($scope) {
                $scope.percent = 0;
                $scope.$watch('value', function(value) {
                    $scope.percent = (value / $scope.nextLevel) * 100;
                });
            },
            restrict: 'EA',
            scope: {
                value: '=',
                nextLevel: '='
            }
        };

    });
