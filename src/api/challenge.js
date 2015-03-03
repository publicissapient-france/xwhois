var first = false;
var challenge1 = {
    firstImage: '/images/Sebastian Le Merdy.jpg',
    secondImage: '/images/Antoine Michaud.jpg',
    name: 'Sébastian Le Merdy',
    answer: "firstImage"
};
var challenge2 = {
    firstImage: '/images/Sebastian Le Merdy.jpg',
    secondImage: '/images/Antoine Michaud.jpg',
    name: 'Antoine Michaud',
    answer: "secondImage"
};

exports.createChallenge = function () {
    return {
        "reinit": function () { // TODO this is for test puprose only : see how to remove it
            first = false;
            return this;
        },
        "createChallenge": function () {
            first = !first;
            if (first) {
                return challenge1;
            } else {
                return challenge2;
            }
        }
    };
};
