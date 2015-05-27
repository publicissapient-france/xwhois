var Q = require('q');

var people = [],
    lastModifiedDate = new Date(0);

module.exports = {
    'getAllPeople': function () {
        return people;
    },
    'findPerson': function (name) {
        return people.filter(function (person) {
            return person.name === name;
        }).shift();
    },
    'isEmpty': function () {
        return people.length === 0;
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
        var personFromDb = this.findPerson(person.name);

        if (personFromDb === undefined) {
            people.push(person);
        } else {
            personFromDb.image = person.image;
            personFromDb.contentType = person.contentType;
            personFromDb.lastModifiedDate = person.lastModifiedDate;
        }

        deferred.resolve(person);
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
