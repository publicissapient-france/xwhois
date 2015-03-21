var cheerio = require('cheerio'),
    confluence = require('./infrastructure/confluence'),
    trombinoscopeDb = require('./infrastructure/trombinoscopeDb');

function extractImage(element, index, self) {
    var image = element.find('ri\\:attachment').attr('ri:filename');
    if (image !== undefined) {
        self.getPeople(index)['filename'] = image;
    }
    self.getPeople(index)['href'] = element.find('ri\\:url').attr('ri:value');
}

function sanitize(content) {
    var sanitizedContent = content, infiniteLoopGuardCount = 0;
    while (sanitizedContent.indexOf('<') !== -1 && infiniteLoopGuardCount < 10) {
        sanitizedContent = sanitizedContent.replace(/<[a-zA-Z =":(0-9,);]+>(.+)/gi, '$1');
        sanitizedContent = sanitizedContent.replace(/(.+)<\/[a-zA-Z]+>/gi, '$1');
        sanitizedContent = sanitizedContent.replace(/(.+)<br>(.+)/gi, '$1$2');
        infiniteLoopGuardCount++;
    }
    return sanitizedContent;
}

function lastModifiedDatesAreSame(lastModifiedDateFromConfluence) {
    var lastModifiedDateFromDb = trombinoscopeDb.getLastModifiedDate();

    if (lastModifiedDateFromDb === undefined) {
        return false;
    }

    return lastModifiedDateFromConfluence.getTime() === lastModifiedDateFromDb.getTime()
}

function findPeople(filename, self) {
    for (var i = 0; i < self.people.length; i++) {
        if (self.people[i]['filename'] === filename) {
            return self.people[i];
        }
    }
    return undefined;
}

module.exports = {
    'people': [],

    'reset': function () {
        this.people = [];
    },

    'getPeople': function (index) {
        if (this.people[index] === undefined) {
            this.people[index] = {};
        }
        return this.people[index];
    },

    'parse': function () {
        confluence.content(process.env.RESOURCE_ID, function (content) {
            var $ = cheerio.load(content),
                self = this,
                lastModifiedDate = new Date($('lastModifiedDate').attr('date'));

            if (lastModifiedDatesAreSame(lastModifiedDate)) {
                console.log('no need to update because last modified date hasn\'t change since last update: ', lastModifiedDate);
                return;
            }

            $ = cheerio.load($.root().text());

            $('th').each(function (index) {
                self.getPeople(index)['name'] = sanitize($(this).html());
            });

            $('ac\\:image').each(function (index) {
                extractImage($(this), index, self);
            });

            confluence.attachments(process.env.RESOURCE_ID, function (content) {
                var $ = cheerio.load(content);

                $('attachment').each(function () {
                    var attachment = $(this),
                        filename = attachment.attr('filename'),
                        href = attachment.find('link[rel=download]').attr('href'),
                        people = findPeople(filename, self);

                    if (people === undefined) {
                        return;
                    }

                    delete people['filename'];
                    people['href'] = href;
                });
            }, function (error) {
                console.log(error);
            })
        }, function (error) {
            console.log(error);
        });
    }
};
