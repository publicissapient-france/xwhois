var Q = require('q'),
    mongoose = require('mongoose');

var LastModifiedDate = mongoose.model('lastModifiedDate', {id: {type: Number, index: true}, value: Date}),
    Person = mongoose.model('person', {
        name: {type: String, index: true},
        image: Buffer,
        contentType: String,
        lastModifiedDate: Date
    });

module.exports = {
    'getAllPeople': function () {
        var deferred = Q.defer();
        mongoose.connect('mongodb://localhost/xwhois-test')
            .connection.once('open', function () {
                Person.find({}, 'name image contentType lastModifiedDate', function (error, people) {
                    mongoose.connection.close(function () {
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
                });
            });
        return deferred.promise;
    },
    'findPerson': function (name) {
        var deferred = Q.defer();
        mongoose.connect('mongodb://localhost/xwhois-test')
            .connection.once('open', function () {
                Person.findOne({name: name}, function (error, person) {
                    mongoose.connection.close(function () {
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
                });
            });
        return deferred.promise;
    },
    'isNotEmpty': function () {
        var deferred = Q.defer();
        mongoose.connect('mongodb://localhost/xwhois-test')
            .connection.once('open', function () {
                Person.count({}, function (err, count) {
                    mongoose.connection.close(function () {
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
                });
            });
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

        mongoose.connect('mongodb://localhost/xwhois-test')
            .connection.once('open', function () {
                Person.findOneAndUpdate({name: person.name}, person, {upsert: true}, function (error, person) {
                    mongoose.connection.close(function () {
                        if (error) {
                            deferred.reject(error);
                        } else {
                            deferred.fulfill(person);
                        }
                    });
                });
            });

        return deferred.promise;
    },
    'reset': function () {
        var deferred = Q.defer();
        mongoose.connect('mongodb://localhost/xwhois-test')
            .connection.once('open', function () {
                Person.remove({})
                    .then(function () {
                        LastModifiedDate.findOneAndRemove(0, function (err, lastModifiedDate) {
                            mongoose.connection.close(function () {
                                if (err) {
                                    deferred.reject(err);
                                    return;
                                }
                                deferred.fulfill();
                            });
                        });
                    });
            });
        return deferred.promise;
    }
};
