var cheerio = require('cheerio'),
    confluence = require('./infrastructure/confluence'),
    trombinoscopeDb = require('./infrastructure/trombinoscopeDb'),
    people = [];

function extractImage(element, index) {
    var image = element.find('ri\\:attachment').attr('ri:filename');
    if (image !== undefined) {
        people[index]['filename'] = image;
        return;
    }
    people[index]['href'] = element.find('ri\\:url').attr('ri:value');
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

function findPerson(filename) {
    return people.filter(function (person) {
        return person.filename === filename;
    })[0];
}

function download(person) {
    confluence.download(person['href'], function (content) {
        person['imageAsByteArray'] = new Buffer(content);
        delete person['href'];
        trombinoscopeDb.updatePerson(person);
    });
}

module.exports = {
    'checkEnvironmentVariable': function () {
        if (process.env.CONFLUENCE_RESOURCE_ID === undefined) {
            throw 'Environment variable CONFLUENCE_RESOURCE_ID should be defined';
        }
    },

    'reset': function () {
        people = [];
    },

    'getPerson': function (index) {
        return people[index];
    },

    'parsePeople': function () {
        confluence.content(process.env.CONFLUENCE_RESOURCE_ID, function (content) {
            var $ = cheerio.load(content),
                lastModifiedDateFromConfluence = new Date($('lastModifiedDate').attr('date')),
                attachmentsSize = $('attachments').attr('size');

            if (lastModifiedDateFromConfluence.getTime() === trombinoscopeDb.getLastModifiedDate().getTime()) {
                console.log('no need to update because last modified date hasn\'t change since last update: ', lastModifiedDateFromConfluence);
                return;
            }

            $ = cheerio.load($.root().text());

            $('th').each(function (index) {
                people[index] = {};
                people[index]['name'] = sanitize($(this).html());
            });

            $('ac\\:image').each(function (index) {
                extractImage($(this), index);
            });

            confluence.attachments(process.env.CONFLUENCE_RESOURCE_ID, function (content) {
                var $ = cheerio.load(content);

                $('attachment').each(function () {
                    var attachment = $(this),
                        filename = attachment.attr('filename'),
                        person = findPerson(filename);

                    if (person === undefined) {
                        return;
                    }

                    delete person['filename'];
                    person['contentType'] = attachment.attr('contenttype');
                    person['href'] = attachment.find('link[rel=download]').attr('href');
                    person['lastModifiedDate'] = attachment.find('lastModifiedDate').attr('date');
                    download(person);
                });

                people.filter(function (person) {
                    return person['href'] !== undefined;
                }).forEach(function (person) {
                    download(person);
                });

                trombinoscopeDb.updateLastModifiedDate(lastModifiedDateFromConfluence);
            }, function (error) {
                console.log(error);
            }, attachmentsSize);
        }, function (error) {
            console.log(error);
        });
    }
};
