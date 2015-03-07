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
