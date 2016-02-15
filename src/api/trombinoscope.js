var cheerio = require('cheerio'),
    confluence = require('./infrastructure/confluence'),
    trombinoscopeDb = require('./infrastructure/trombinoscopeDb'),
    person = require('./person'),
    people = [];

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
            .catch(function (reason) {
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

                    var index = 0;
                    $('table').each(function () {
                        var names = $(this).find('th'),
                            images = $(this).find('img'),
                            imagesIndex = 0;
                        for (var namesIndex = 0; namesIndex < names.length; namesIndex++) {
                            var name = $(names[namesIndex]).text().trim();
                            if (name === "") {
                                continue;
                            }

                            var dataImageSrc = $(images[imagesIndex]).attr('data-image-src');
                            if (dataImageSrc === undefined) {
                               console.error('data-image-src attribute is not present for ' + name);
                               continue;
                            }

                            people[index] = person($(names[namesIndex]).html());
                            people[index].setHref(dataImageSrc);
                            console.log('discovered', people[index].getName(), 'with url', dataImageSrc);
                            index++;
                            imagesIndex++;
                        }
                    });

                    confluence.attachments(process.env.CONFLUENCE_RESOURCE_ID, function (content) {
                        downloadByAttachment(JSON.parse(content), function () {
                            downloadByUrl(function () {
                                trombinoscopeDb.updateLastModifiedDate(lastModifiedDateFromConfluence);
                            });
                        });
                    }, function (error) {
                        console.error(error);
                    }, ATTACHMENTS_SIZE);
                })
                .catch(function (reason) {
                    console.error('Unable to get last modified date because', reason);
                })
        }, function (error) {
            console.log(error);
        }, ["body.view", "version"]);
    }
};
