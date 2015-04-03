module.exports = function (publicPath) {
    var first = false;
    return {
        createChallenge: function () {
            first = !first;
            return first ? {
                firstImage: publicPath + '/' + 'Firstname1 Lastname1',
                secondImage: publicPath + '/' + 'Firstname2 Lastname2',
                name: 'Firstname1 Lastname1',
                answer: 'firstImage'
            } : {
                firstImage: publicPath + '/' + 'Firstname2 Lastname2',
                secondImage: publicPath + '/' + 'Firstname1 Lastname1',
                name: 'Firstname2 Lastname2',
                answer: 'secondImage'
            };
        }
    };
};
