var Promise = require('bluebird'),
    mongoose = Promise.promisifyAll(require('mongoose'));

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
        return mongoose.connectAsync(uri);
    },
    'close': function () {
        return mongoose.connection.closeAsync();
    },
    'getAllPeople': function () {
        return new Promise(function (resolve, reject) {
            Person.find({}, 'name image contentType lastModifiedDate', function (error, people) {
                if (error) {
                    reject(error);
                    return;
                }
                if (people === null) {
                    resolve();
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
                resolve(extractedPeople);
            });
        });
    },
    'findPerson': function (name) {
        return new Promise(function (resolve, reject) {
            Person.findOne({name: name}, function (error, person) {
                if (error || person === null) {
                    reject('person identified by ' + name + ' was not found');
                    return;
                }
                resolve(person);
            });
        });
    },
    'isNotEmpty': function () {
        return new Promise(function (resolve, reject) {
            Person.count({}, function (err, count) {
                if (err) {
                    reject(err);
                    return;
                }
                if (count === 0) {
                    reject('database is empty');
                    return;
                }
                resolve();
            });
        });
    },
    'getLastModifiedDate': function () {
        return new Promise(function (resolve, reject) {
            LastModifiedDate.findOne({id: 0}, function (error, lastModifiedDate) {
                if (error) {
                    reject(error);
                    return;
                }
                if (lastModifiedDate === null) {
                    resolve();
                    return;
                }
                resolve(lastModifiedDate.value);
            });
        });
    },
    'updateLastModifiedDate': function (newLastModifiedDate) {
        return new Promise(function (resolve, reject) {
            new LastModifiedDate({id: 0, value: newLastModifiedDate}).save()
                .then(function (lastModifiedDate) {
                    resolve(lastModifiedDate.value);
                })
                .onReject(function (error) {
                    reject(error);
                });
        });
    },
    'updatePerson': function (person) {
        return new Promise(function (resolve, reject) {
            Person.findOneAndUpdate({name: person.name}, person, {upsert: true}, function (error, person) {
                if (error) {
                    reject(error);
                } else {
                    resolve(person);
                }
            });
        });
    },
    'removePerson': function (person) {
        return new Promise(function (resolve, reject) {
            Person.remove({name: person.name}, function (error) {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    },
    'reset': function () {
        return new Promise(function (resolve, reject) {
            Person.remove({})
                .then(function () {
                    LastModifiedDate.findOneAndRemove(0, function (err, lastModifiedDate) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve();
                    });
                });
        });
    }
};
