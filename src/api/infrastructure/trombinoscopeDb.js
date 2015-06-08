var Q = require('q'),
    mongoose = require('mongoose');

var LastModifiedDate = mongoose.model('lastModifiedDate', {id: {type: Number, index: true}, value: Date}),
    Person = mongoose.model('person', {
        name: {type: String, index: true},
        image: Buffer,
        contentType: String,
        lastModifiedDate: Date
    }),
    uri = process.env.MONGODB_URI || 'mongodb://localhost/xwhois-test';

module.exports = {
    'connect': function () {
        var deferred = Q.defer();
        var connection = mongoose.connect(uri).connection;
        connection.once('open', function () {
                deferred.fulfill();
            });
        connection.once('error', function (error) {
                deferred.reject(error);
            });
        return deferred.promise;
    },
    'close': function () {
        var deferred = Q.defer();
        mongoose.connection.close(function () {
            deferred.fulfill();
        });
        return deferred.promise;
    },
    'getAllPeople': function () {
        var deferred = Q.defer();
                Person.find({}, 'name image contentType lastModifiedDate', function (error, people) {
                        if (error) {
                            deferred.reject(error);
                            return;
                        }
                        if (people === null) {
                            deferred.fulfill();
                            return;
                        }
                        var extractedPeople = [];
                        for (var i = 0; i < people.length; i++) {
                            extractedPeople.push({
                                'name': people[i].get('name'),
                                'image': people[i].get('image'),
                                'contentType': people[i].get('contentType'),
                                'lastModifiedDate': people[i].get('lastModifiedDate')
                            });
                        }
                        deferred.fulfill(extractedPeople);
                });
        return deferred.promise;
    },
    'findPerson': function (name) {
        var deferred = Q.defer();
                Person.findOne({name: name}, function (error, person) {
                        if (error) {
                            deferred.reject(person + 'was not found');
                            return;
                        }
                        if (person === null) {
                            deferred.reject();
                            return;
                        }
                        deferred.fulfill(person);
                });
        return deferred.promise;
    },
    'isNotEmpty': function () {
        var deferred = Q.defer();
                Person.count({}, function (err, count) {
                        if (err) {
                            deferred.reject(err);
                            return;
                        }
                        if (count === 0) {
                            deferred.reject('database is empty');
                            return;
                        }
                        deferred.fulfill();
                });
        return deferred.promise;
    },
    'getLastModifiedDate': function () {
        var deferred = Q.defer();
                LastModifiedDate.findOne({id: 0}, function (error, lastModifiedDate) {
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
        return deferred.promise;
    },
    'updateLastModifiedDate': function (newLastModifiedDate) {
        var deferred = Q.defer();
                new LastModifiedDate({id: 0, value: newLastModifiedDate}).save()
                    .then(function (lastModifiedDate) {
                            deferred.fulfill(lastModifiedDate.value);
                    })
                    .onReject(function (error) {
                            deferred.reject(error);
                    });
        return deferred.promise;
    },
    'updatePerson': function (person) {
        var deferred = Q.defer();
                Person.findOneAndUpdate({name: person.name}, person, {upsert: true}, function (error, person) {
                        if (error) {
                            deferred.reject(error);
                        } else {
                            deferred.fulfill(person);
                        }
                });
        return deferred.promise;
    },
    'reset': function () {
        var deferred = Q.defer();
                Person.remove({})
                    .then(function () {
                        LastModifiedDate.findOneAndRemove(0, function (err, lastModifiedDate) {
                                if (err) {
                                    deferred.reject(err);
                                    return;
                                }
                                deferred.fulfill();
                        });
                    });
        return deferred.promise;
    }
};
