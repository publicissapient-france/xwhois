var findPerson = function (name, people) {
    return people.filter(function (person) {
        return person.name === name;
    }).shift();
};

module.exports = {
    'people': [],
    'lastModifiedDate': new Date(0),
    'getLastModifiedDate': function () {
        return this.lastModifiedDate;
    },
    'updateLastModifiedDate': function (lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    },
    'updatePerson': function (person) {
        var personFromDb = findPerson(person.name, this.people);

        if (personFromDb === undefined) {
            this.people.push(person);
        } else {
            personFromDb.name = person.name;
            personFromDb.imageAsByteArray = person.imageAsByteArray;
            personFromDb.lastModifiedDate = person.lastModifiedDate;
        }
    },
    'reset': function () {
        this.people = [];
        this.lastModifiedDate = new Date(0);
    }
};
