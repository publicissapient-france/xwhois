var cheerio = require('cheerio'),
    https = require('https');

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
    this.hostname = process.env.HOSTNAME;
    this.path = process.env.PATH;
    this.auth = process.env.USER + ':' + process.env.PASSWORD;
    this.people = [];
    this.content = '';
};

Trombinoscope.prototype.getPeople = function (index) {
    if (this.people[index] === undefined) {
        this.people[index] = {};
    }
    return this.people[index];
};

Trombinoscope.prototype.getContent = function (callback) {
    var self = this,
        request = https.get({
            'hostname': self.hostname,
            'path': self.path,
            'auth': self.auth
        }, function (response) {
            response.on('data', function (chunk) {
                self.content += chunk;
            });

            response.on('end', function () {
                self.parse();
                callback();
            });
        });

    request.on('error', function (e) {
        console.log(e);
    });
};

Trombinoscope.prototype.parse = function () {
    var $ = cheerio.load(cheerio.load(this.content).root().text()), self = this;

    $('ac\\:image').each(function (index) {
        self.getPeople(index)['image'] = extractImage($(this));
    });

    $('th').each(function (index) {
        self.getPeople(index)['name'] = sanitize($(this).html());
    });
};

module.exports = function () {
    return new Trombinoscope();
};
