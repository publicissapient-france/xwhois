var cheerio = require('cheerio'),
    confluence = require('./infrastructure/confluence'),
    trombinoscopeDb = require('./infrastructure/trombinoscopeDb'),
    person = require('./person'),
    people = [];

function prepareDownload(element, index) {
    var image = element.find('ri\\:attachment').attr('ri:filename');
    if (image !== undefined) {
        people[index].setFilename(image);
        console.log(people[index].getName(), ' has filename ', image);
        return;
    }
    people[index].prepareDownloadByUrl(element.find('ri\\:url').attr('ri:value'));
    console.log(people[index].getName(), ' has url ', people[index].getHref());
}

function findPerson(filename) {
    return people.filter(function (person) {
        return person.getFilename() === filename;
    }).shift();
}

function downloadByAttachment($) {
    $('attachment').each(function () {
        var attachment = $(this),
            filename = attachment.attr('filename'),
            person = findPerson(filename);

        if (person === undefined) {
            console.log(filename, ' is not bound to anyone');
            return;
        }

        person.prepareDownloadByAttachment(attachment.attr('contenttype'), attachment.find('link[rel=download]').attr('href'), attachment.find('lastModifiedDate').attr('date'));
        console.log(person.getName(), ' has url ', person.getHref(), ' last updated at ', person.getLastModifiedDate());
        download(person);
    });
}

function downloadByUrl() {
    people.filter(function (person) {
        return person.isReadyToDownload();
    }).forEach(function (person) {
        download(person);
    });
}

function download(person) {
    console.log('download of', person.getName(), 'from', person.getHref(), 'will start');
    confluence.download(person.getHref(), function (content) {
        console.log('download of', person.getName(), 'from', person.getHref(), 'is finished with', content.length, 'bytes');
        person.downloaded(content);
        trombinoscopeDb.updatePerson(person.export());
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
                lastModifiedDateFromConfluence = new Date($('lastModifiedDate').attr('date'));

            if (lastModifiedDateFromConfluence.getTime() === trombinoscopeDb.getLastModifiedDate().getTime()) {
                console.log('no need to update because last modified date hasn\'t change since last update: ', lastModifiedDateFromConfluence);
                return;
            }

            var attachmentsSize = $('attachments').attr('size');

            $ = cheerio.load($.root().text());

            $('th').each(function (index) {
                people[index] = person($(this).html());
                console.log('discovered ', people[index].getName());
            });

            $('ac\\:image').each(function (index) {
                prepareDownload($(this), index);
            });

            confluence.attachments(process.env.CONFLUENCE_RESOURCE_ID, function (content) {
                downloadByAttachment(cheerio.load(content));
                downloadByUrl();
                trombinoscopeDb.updateLastModifiedDate(lastModifiedDateFromConfluence);
            }, function (error) {
                console.log(error);
            }, attachmentsSize);
        }, function (error) {
            console.log(error);
        });
    }
};
