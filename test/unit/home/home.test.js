'use strict';

describe('home controller', function () {

    beforeEach(module('app.xwhois'));

    beforeEach(inject(function ($routes) {
        this.$routes = $routes;
    }));

    it('should do nothing', inject(function () {
        expect(10).to.equal(10);
    }));

});
