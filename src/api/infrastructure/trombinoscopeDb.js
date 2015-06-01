var Q = require('q'),
    mongoose = require('mongoose');

var people = [],
    LastModifiedDate = mongoose.model('lastModifiedDate', {id: {type: Number, index: true}, value: Date});

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
        mongoose.connect('mongodb://localhost/xwhois-test')
            .connection.once('open', function () {
                LastModifiedDate.findOne({id: 0}, function (error, lastModifiedDate) {
                    mongoose.connection.close(function () {
                        if (error) {
                            deferred.reject(error);
                            return;
                        }
                        if (lastModifiedDate === null) {
                            deferred.fulfill();
                            return;
                        }
                        deferred.fulfill(lastModifiedDate.value);
                    });
                });
            });
        return deferred.promise;
    },
    'updateLastModifiedDate': function (newLastModifiedDate) {
        var deferred = Q.defer();
        mongoose.connect('mongodb://localhost/xwhois-test')
            .connection.once('open', function () {
                new LastModifiedDate({id: 0, value: newLastModifiedDate}).save()
                    .then(function (lastModifiedDate) {
                        mongoose.connection.close(function () {
                            deferred.fulfill(lastModifiedDate.value);
                        })
                    })
                    .onReject(function (error) {
                        mongoose.connection.close(function () {
                            deferred.reject(error);
                        })
                    });
            });
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
        mongoose.connect('mongodb://localhost/xwhois-test')
            .connection.once('open', function () {
                LastModifiedDate.findOneAndRemove(0, function (err, lastModifiedDate) {
                    mongoose.connection.close(function () {
                        if (err) {
                            deferred.reject(err);
                            return;
                        }
                        people = [];
                        deferred.fulfill();
                    });
                });
            });
        return deferred.promise;
    }
};
