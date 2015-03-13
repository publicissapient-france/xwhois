var cheerio = require('cheerio'),
    confluence = require('./infrastructure/confluence');

var extractImage = function (element) {
    var image = element.find('ri\\:attachment').attr('ri:filename');
    if (image === undefined) {
        image = element.find('ri\\:url').attr('ri:value');
    }
    return image;
};

var sanitize = function (content) {
    var sanitizedContent = content, infiniteLoopGuardCount = 0;
    while (sanitizedContent.indexOf('<') !== -1 && infiniteLoopGuardCount < 10) {
        sanitizedContent = sanitizedContent.replace(/<[a-zA-Z =":(0-9,);]+>(.+)/gi, '$1');
        sanitizedContent = sanitizedContent.replace(/(.+)<\/[a-zA-Z]+>/gi, '$1');
        sanitizedContent = sanitizedContent.replace(/(.+)<br>(.+)/gi, '$1$2');
        infiniteLoopGuardCount++;
    }
    return sanitizedContent;
};

var Trombinoscope = function () {
    this.people = [];
    this.content = '';
};

Trombinoscope.prototype.getPeople = function (index) {
    if (this.people[index] === undefined) {
        this.people[index] = {};
    }
    return this.people[index];
};

Trombinoscope.prototype.parse = function () {
    confluence.content(process.env.RESOURCE_ID, function (content) {
        var $ = cheerio.load(cheerio.load(content).root().text()), self = this;

        $('ac\\:image').each(function (index) {
            self.getPeople(index)['image'] = extractImage($(this));
        });

        $('th').each(function (index) {
            self.getPeople(index)['name'] = sanitize($(this).html());
        });
    }, function (error) {
        console.log(error);
    });
};

module.exports = new Trombinoscope();
