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
                .catch(function (reason) {
                    assert.strictEqual(reason, 'database is empty', 'failure message');
                    return self;
                });
        },
        "lastModifiedDateIsEmpty": function () {
            var self = this;
            return actualTrombinoscopeDb.getLastModifiedDate()
                .then(function (lastModifiedDate) {
                    assert.ok(!lastModifiedDate, 'last modified date is undefined');
                    return self;
                });
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
                    return assertThatTrombinoscopeDb.lastModifiedDateIsEmpty();
                });
        },
        'containsExactly': function (person) {
            var self = this;
            return actualTrombinoscopeDb.getAllPeople()
                .then(function (people) {
                    assert.deepEqual(people[0], person, 'person');
                    return self;
                });
        }
    };
};

describe('Trombinoscope Db Module', function () {
    beforeEach(function (done) {
        trombinoscopeDb.connect()
            .then(function () {
                return trombinoscopeDb.reset();
            })
            .then(done)
            .catch(function (error) {
                done(new Error(error));
            });
    });

    afterEach(function (done) {
        trombinoscopeDb.close()
            .then(done)
            .catch(function (error) {
                done(new Error(error));
            })
    });

    it('should be initialized', function (done) {
        // then
        assertThat(trombinoscopeDb).isEmpty()
            .then(function (assertThatTrombinoscopeDb) {
                return assertThatTrombinoscopeDb.lastModifiedDateIsEmpty();
            })
            .then(function () {
                done();
            })
            .catch(done);
    });

    it('should update modification date', function (done) {
        // when
        trombinoscopeDb.updateLastModifiedDate(new Date(1000))
            .then(function (value) {

                // then
                assert.strictEqual(value.getTime(), new Date(1000).getTime());
                return assertThat(trombinoscopeDb).lastModifiedDateIs(new Date(1000));
            })
            .then(function () {
                done()
            })
            .catch(done);
    });

    it('should find a person by name', function (done) {
        // given
        var person = {
            'name': 'name'
        };
        trombinoscopeDb.updatePerson(person)
            .then(function () {

                // when
                return trombinoscopeDb.findPerson('name');
            })
            .then(function (found) {

                // then
                assert.strictEqual(found.name, person.name);
                done();
            })
            .catch(done);
    });

    it('should not find unknown person', function (done) {
        // when
        var found = trombinoscopeDb.findPerson('name')
            .then(function (found) {

                // then
                assert.fail(found, undefined, 'found person');
            })
            .catch(function (error) {
                assert.equal(error, 'person identified by name was not found', 'error\'s message')
            })
            .finally(done);
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
                return assertThat(trombinoscopeDb).containsExactly(newPerson);
            })
            .then(function () {
                done();
            })
            .catch(done);
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
                return assertThat(trombinoscopeDb).containsExactly(updatedPerson);
            })
            .then(function () {
                done();
            })
            .catch(done);
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
            .catch(done);
    });
});
