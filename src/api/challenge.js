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

module.exports = function () {
    var first = false;
    return {
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
