var cheerio = require('cheerio'),
    confluence = require('./infrastructure/confluence'),
    trombinoscopeDb = require('./infrastructure/trombinoscopeDb'),
    person = require('./person'),
    people = [];

function prepareDownload(element, index) {
    var dataImageSrc = element.attr('data-image-src');
    if (dataImageSrc !== undefined) {
        people[index].setHref(dataImageSrc);
        console.log(people[index].getName(), 'has url', dataImageSrc);
    }
}

function findPerson(href) {
    return people.filter(function (person) {
        return person.getHref() === href;
    }).shift();
}

function downloadByAttachment(attachments, done) {
    var peopleReadyToDownload = [];

    attachments.results.forEach(function (attachment) {
        var url = attachment._links.download,
            person = findPerson(url);

        if (person === undefined) {
            console.log(url, 'is not bound to anyone');
            return;
        }

        person.prepareDownload(attachment.metadata.mediaType, url, attachment.version.when);
        peopleReadyToDownload.push(person);
        console.log(person.getName(), 'has url', person.getHref(), 'last updated at', person.getLastModifiedDate());
    });

    console.log('trombinoscope.downloadByAttachment start downloading', peopleReadyToDownload.length, 'people');
    download(peopleReadyToDownload, done);
}

function downloadByUrl(done) {
    var peopleReadyToDownload = people.filter(function (person) {
        return person.isReadyToDownload();
    });
    console.log('trombinoscope.downloadByUrl start downloading', peopleReadyToDownload.length, 'people');
    download(peopleReadyToDownload, done);
}

function download(peopleReadyToDownload, done) {
    if (peopleReadyToDownload.length === 0) {
        done();
        return;
    }

    var person = peopleReadyToDownload.shift();

    console.log('download of', person.getName(), 'from', person.getHref(), 'will start');
    confluence.download(person.getHref(), function (content) {
        console.log('download of', person.getName(), 'from', person.getHref(), 'is finished with', content.length, 'bytes');
        person.downloaded(content);
        trombinoscopeDb.updatePerson(person.exportToJSON())
            .then(function () {
                download(peopleReadyToDownload, done);
            })
            .fail(function (reason) {
                console.log('download of', person.getName(), 'has failed:', reason);
                person.downloadFailed();
                download(peopleReadyToDownload, done);
            });
    }, function () {
        console.log('download of', person.getName(), 'has failed');
        person.downloadFailed();
        download(peopleReadyToDownload, done);
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
            var resource, lastModifiedDateFromConfluence;

            try {
                resource = JSON.parse(content);
            } catch (error) {
                console.error("error when parsing ", error, content);
                return;
            }

            try {
                lastModifiedDateFromConfluence = new Date(resource.version.when);
            } catch (error) {
                console.error(error);
                return;
            }

            trombinoscopeDb.getLastModifiedDate()
                .then(function (lastModifiedDate) {
                    if (lastModifiedDate && lastModifiedDateFromConfluence.getTime() === lastModifiedDate.getTime()) {
                        console.log('no need to update because last modified date hasn\'t change since last update:', lastModifiedDateFromConfluence);
                        return;
                    }
                    const ATTACHMENTS_SIZE = 1000;

                    var $;

                    try {
                        $ = cheerio.load(resource.body.view.value);
                    } catch (error) {
                        console.error(error);
                        return;
                    }

                    $('th').each(function (index) {
                        people[index] = person($(this).html());
                        console.log('discovered', people[index].getName());
                    });

                    $('img').each(function (index) {
                        prepareDownload($(this), index);
                    });

                    confluence.attachments(process.env.CONFLUENCE_RESOURCE_ID, function (content) {
                        downloadByAttachment(JSON.parse(content), function () {
                            downloadByUrl(function () {
                                trombinoscopeDb.updateLastModifiedDate(lastModifiedDateFromConfluence);
                            });
                        });
                    }, function (error) {
                        console.log(error);
                    }, ATTACHMENTS_SIZE);
                })
                .fail(console.log('Unable to get last modified date'));
        }, function (error) {
            console.log(error);
        }, ["body.view", "version"]);
    }
};
