var first = false;
module.exports = {
    'createChallenge': function (publicPath) {
        first = !first;
        return first ? {
            firstImage: publicPath + '/' + 'Firstname1 Lastname1',
            secondImage: publicPath + '/' + 'Firstname2 Lastname2',
            name: 'Firstname1 Lastname1'
        } : {
            firstImage: publicPath + '/' + 'Firstname2 Lastname2',
            secondImage: publicPath + '/' + 'Firstname1 Lastname1',
            name: 'Firstname2 Lastname2'
        };
    },

    'validAnswer': function (answer) {
        var imagePathArray = answer.image.split('/');
        return answer.name === imagePathArray[imagePathArray.length - 1];
    }
};
