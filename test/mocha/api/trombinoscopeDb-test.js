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

    it('should find a person by name', function () {
        var person = {
            'name': 'name'
        };
        trombinoscopeDb.updatePerson(person);

        var found = trombinoscopeDb.findPerson('name');

        assert.strictEqual(found, person);
    });

    it('should not find unknown person', function () {
        var found = trombinoscopeDb.findPerson('name');

        assert.strictEqual(found, undefined);
    });

    it ('should insert person', function () {
        var newPerson = {
            'name': 'name',
            'imageAsByteArray': new Buffer('abc'),
            'contentType': 'image/jpeg',
            'lastModifiedDate': new Date(0)
        };

        trombinoscopeDb.updatePerson(newPerson);

        assertThat(trombinoscopeDb).containsExactly(newPerson);
    });

    it ('should update person', function () {
        trombinoscopeDb.updatePerson({
            'name': 'name',
            'imageAsByteArray': new Buffer('abc'),
            'contentType': 'image/jpeg',
            'lastModifiedDate': new Date(0)
        });
        var updatedPerson = {
            'name': 'name',
            'imageAsByteArray': new Buffer('def'),
            'contentType': 'image/png',
            'lastModifiedDate': new Date(1000)
        };

        trombinoscopeDb.updatePerson(updatedPerson);

        assertThat(trombinoscopeDb).containsExactly(updatedPerson);
    });

    it ('should reset', function () {
        trombinoscopeDb.updateLastModifiedDate(new Date(1000));
        trombinoscopeDb.updatePerson({
            'name': 'name',
            'imageAsByteArray': new Buffer('abc'),
            'contentType': 'image/jpeg',
            'lastModifiedDate': new Date(0)
        });

        trombinoscopeDb.reset();

        assertThat(trombinoscopeDb).isReseted();
    });
});
