var fs = require('fs');

module.exports = function (imagesPath, publicPath) {
    var photos = fs.readdirSync(imagesPath);
    var first = false;
    return {
        createChallenge: function () {
            first = !first;
            return first ? {
                firstImage: publicPath + '/' + photos[1],
                secondImage: publicPath + '/' + photos[0],
                name: 'Sébastian Le Merdy',
                answer: 'firstImage'
            } : {
                firstImage: publicPath + '/' + photos[1],
                secondImage: publicPath + '/' + photos[0],
                name: 'Antoine Michaud',
                answer: 'secondImage'
            };
        }
    };
};


// http://www.obsessedwithconformity.com/wp-content/uploads/keyser-soze11.jpg
// http://www.metroactive.com/papers/metro/05.29.97/gifs/brassed-off2-9722.jpg
