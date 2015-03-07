'use strict';

angular.module('app.xwhois')
    .directive('loader', function () {

        return {
            templateUrl: 'components/loading/loader/loader.html',
            controller: function($scope, $interval) {
                if (angular.isUndefined($scope.loading)) {
                    $scope.loading = true;
                }

                var clearInterval = false;
                var step = 10;

                $scope.$watch('loading', function(loading) {
                    if (loading) {
                        $scope.percent = 0;
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

            },
            restrict: 'E',
            scope: {
                loading: '=?'
            }
        };

    });
