var findPerson = function (name, people) {
        return people.filter(function (person) {
            return person.name === name;
        }).shift();
    },
    people = [],
    lastModifiedDate = new Date(0);

module.exports = {
    'getAllPeople': function () {
        return people;
    },
    'isEmpty': function () {
        return people.length === 0;
    },
    'getLastModifiedDate': function () {
        return lastModifiedDate;
    },
    'updateLastModifiedDate': function (newLastModifiedDate) {
        lastModifiedDate = newLastModifiedDate;
    },
    'updatePerson': function (person) {
        var personFromDb = findPerson(person.name, people);

        if (personFromDb === undefined) {
            people.push(person);
        } else {
            personFromDb.name = person.name;
            personFromDb.imageAsByteArray = person.imageAsByteArray;
            personFromDb.lastModifiedDate = person.lastModifiedDate;
        }

        return person;
    },
    'reset': function () {
        people = [];
        lastModifiedDate = new Date(0);
    }
};
