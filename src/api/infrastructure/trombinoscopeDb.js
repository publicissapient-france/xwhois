var Q = require('q');

var people = [],
    lastModifiedDate = new Date(0);

module.exports = {
    'getAllPeople': function () {
        var deferred = Q.defer();
        deferred.fulfill(people);
        return deferred.promise;
    },
    'findPerson': function (name) {
        var deferred = Q.defer();
        var found = people.filter(function (person) {
            return person.name === name;
        }).shift();

        if (found) {
            deferred.fulfill(found);
        } else {
            deferred.reject(name + ' was not found');
        }

        return deferred.promise;
    },
    'isNotEmpty': function () {
        var deferred = Q.defer();
        if (people.length === 0) {
            deferred.reject('database is empty');
        } else {
            deferred.fulfill();
        }
        return deferred.promise;
    },
    'getLastModifiedDate': function () {
        var deferred = Q.defer();
        deferred.fulfill(lastModifiedDate);
        return deferred.promise;
    },
    'updateLastModifiedDate': function (newLastModifiedDate) {
        var deferred = Q.defer();
        lastModifiedDate = newLastModifiedDate;
        deferred.fulfill(lastModifiedDate);
        return deferred.promise;
    },
    'updatePerson': function (person) {
        var deferred = Q.defer();

        this.findPerson(person.name)
            .then(function (personFromDb) {
                personFromDb.image = person.image;
                personFromDb.contentType = person.contentType;
                personFromDb.lastModifiedDate = person.lastModifiedDate;
                deferred.resolve(personFromDb);
            })
            .fail(function (reason) {
                if (person.name + ' was not found' === reason) {
                    people.push(person);
                    deferred.resolve(person);
                    return;
                }
                deferred.reject(reason);
            });

        return deferred.promise;
    },
    'reset': function () {
        var deferred = Q.defer();
        people = [];
        lastModifiedDate = new Date(0);
        deferred.resolve();
        return deferred.promise;
    }
};
