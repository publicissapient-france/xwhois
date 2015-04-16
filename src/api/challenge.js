var trombinoscopeDb = require('./infrastructure/trombinoscopeDb');

module.exports = function (path) {
    return {
        createChallenge: function () {
            var answearFirst = Math.random() < 0.5,
                people = trombinoscopeDb.getAllPeople(),
                first = people[Math.floor(Math.random() * people.length)],
                second = {};

            do {
                second = people[Math.floor(Math.random() * people.length)];
            } while (first === second);

            return {
                firstImage: path + '/' + first.name,
                secondImage: path + '/' + second.name,
                name: answearFirst ? first.name : second.name
            };
        },
        'validAnswer': function (answer) {
            var imagePathArray = answer.image.split('/');
            return answer.name === imagePathArray[imagePathArray.length - 1];
        }
    };
};
