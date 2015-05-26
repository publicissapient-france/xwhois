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
            assert.deepEqual(actualTrombinoscopeDb.getAllPeople()[0], person, 'people');
            return this;
        }
    };
};

describe('Trombinoscope Db Module', function () {
    beforeEach(function (done) {
        trombinoscopeDb.reset().fin(done);
    });

    it('should be initialized', function () {
        // then
        assertThat(trombinoscopeDb).isEmpty().lastModifiedDateIsEpoch();
    });

    it('should update modification date', function () {
        // when
        trombinoscopeDb.updateLastModifiedDate(new Date(1000));

        // then
        assertThat(trombinoscopeDb).lastModifiedDateIs(new Date(1000));
    });

    it('should find a person by name', function (done) {
        // given
        var person = {
            'name': 'name'
        };
        trombinoscopeDb.updatePerson(person)
            .then(function () {

                // when
                var found = trombinoscopeDb.findPerson('name');

                // then
                assert.strictEqual(found, person);
                done();
            })
            .fail(done);
    });

    it('should not find unknown person', function () {
        // when
        var found = trombinoscopeDb.findPerson('name');

        // then
        assert.strictEqual(found, undefined);
    });

    it('should insert person', function (done) {
        // given
        var newPerson = {
            'name': 'name',
            'image': new Buffer('abc'),
            'contentType': 'image/jpeg',
            'lastModifiedDate': new Date(0)
        };

        // when
        trombinoscopeDb.updatePerson(newPerson)
            .then(function () {

                // then
                assertThat(trombinoscopeDb).containsExactly(newPerson);
                done();
            })
            .fail(done);
    });

    it('should update person', function (done) {
        // given
        var updatedPerson = {
            'name': 'name',
            'image': new Buffer('def'),
            'contentType': 'image/png',
            'lastModifiedDate': new Date(1000)
        };
        trombinoscopeDb.updatePerson({
            'name': 'name',
            'image': new Buffer('abc'),
            'contentType': 'image/jpeg',
            'lastModifiedDate': new Date(0)
        })
            .then(function () {

                // when
                return trombinoscopeDb.updatePerson(updatedPerson);
            })
            .then(function () {

                // then
                assertThat(trombinoscopeDb).containsExactly(updatedPerson);
                done();
            })
            .fail(done);
    });

    it('should reset', function (done) {
        // given
        trombinoscopeDb.updateLastModifiedDate(new Date(1000));
        trombinoscopeDb.updatePerson({
            'name': 'name',
            'image': new Buffer('abc'),
            'contentType': 'image/jpeg',
            'lastModifiedDate': new Date(0)
        })
            .then(function () {

                // when
                return trombinoscopeDb.reset();
            })
            .then(function () {

                // then
                assertThat(trombinoscopeDb).isReseted();
                done();
            })
            .fail(done);
    });
});
