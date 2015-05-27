var assert = require('assert'),
    trombinoscopeDb = require('../../../src/api/infrastructure/trombinoscopeDb');

var assertThat = function (actualTrombinoscopeDb) {
    return {
        'isEmpty': function () {
            var self = this;
            return actualTrombinoscopeDb.isNotEmpty()
                .then(function () {
                    assert.fail(true, false, 'trombinoscope db is not empty');
                    return self;
                })
                .fail(function (reason) {
                    assert.strictEqual(reason, 'database is empty', 'failure message');
                    return self;
                });
        },
        'lastModifiedDateIsEpoch': function () {
            return this.lastModifiedDateIs(new Date(0));
        },
        'lastModifiedDateIs': function (expectedDate) {
            var self = this;
            return actualTrombinoscopeDb.getLastModifiedDate()
                .then(function (lastModifiedDate) {
                    assert.strictEqual(lastModifiedDate.getTime(), expectedDate.getTime(), 'last modified date as millis from epoch');
                    return self;
                });
        },
        'isReseted': function () {
            return this.isEmpty()
                .then(function (assertThatTrombinoscopeDb) {
                    return assertThatTrombinoscopeDb.lastModifiedDateIsEpoch();
                });
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

    it('should be initialized', function (done) {
        // then
        assertThat(trombinoscopeDb).isEmpty()
            .then(function (assertThatTrombinoscopeDb) {
                return assertThatTrombinoscopeDb.lastModifiedDateIsEpoch();
            })
            .then(function () {
                done();
            })
            .fail(done);
    });

    it('should update modification date', function (done) {
        // when
        trombinoscopeDb.updateLastModifiedDate(new Date(1000))
            .then(function () {

                // then
                assertThat(trombinoscopeDb).lastModifiedDateIs(new Date(1000));
                done();
            })
            .fail(done);
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
        trombinoscopeDb.updateLastModifiedDate(new Date(1000))
            .then(function () {
                return trombinoscopeDb.updatePerson({
                    'name': 'name',
                    'image': new Buffer('abc'),
                    'contentType': 'image/jpeg',
                    'lastModifiedDate': new Date(0)
                });
            })
            .then(function () {

                // when
                return trombinoscopeDb.reset();
            })
            .then(function () {

                // then
                return assertThat(trombinoscopeDb).isReseted();
            })
            .then(function () {
                done();
            })
            .fail(done);
    });
});
