var assert = require('assert'),
    trombinoscopeDb = require('../../../src/api/infrastructure/trombinoscopeDb');

var assertThat = function (actualTrombinoscopeDb) {
    return {
        'isEmpty': function () {
            assert.ok(actualTrombinoscopeDb.isEmpty(), 'trombinoscope is empty');
            return this;
        },
        'lastModifiedDateIsEpoch': function () {
            assert.strictEqual(actualTrombinoscopeDb.getLastModifiedDate().getTime(), 0, 'last modified date as millis from epoch');
            return this;
        },
        'lastModifiedDateIs': function (expectedDate) {
            assert.strictEqual(actualTrombinoscopeDb.getLastModifiedDate().getTime(), expectedDate.getTime(), 'last modified date as millis from epoch');
            return this;
        },
        'isReseted': function () {
            return this.isEmpty().lastModifiedDateIsEpoch();
        },
        'containsExactly': function (person) {
            assert.deepEqual(actualTrombinoscopeDb.getAllPeople(), [person], 'people');
            return this;
        }
    };
};

describe('Trombinoscope Db Module Test', function () {
    beforeEach(function (done) {
        trombinoscopeDb.reset();
        done();
    });

    it('should be initialized', function () {
        assertThat(trombinoscopeDb).isEmpty().lastModifiedDateIsEpoch();
    });

    it('should update modification date', function () {
        trombinoscopeDb.updateLastModifiedDate(new Date(1000));

        assertThat(trombinoscopeDb).lastModifiedDateIs(new Date(1000));
    });

    it ('should update person', function () {
        var updatedPerson = {
            'name': 'name',
            'imageAsByteArray': new Buffer('abc'),
            'lastModifiedDate': new Date(0)
        };

        trombinoscopeDb.updatePerson(updatedPerson);

        assertThat(trombinoscopeDb).containsExactly(updatedPerson);
    });

    it ('should reset', function () {
        trombinoscopeDb.updateLastModifiedDate(new Date(1000));
        trombinoscopeDb.updatePerson({
            'name': 'name',
            'imageAsByteArray': new Buffer('abc'),
            'lastModifiedDate': new Date(0)
        });

        trombinoscopeDb.reset();

        assertThat(trombinoscopeDb).isReseted();
    });
});
