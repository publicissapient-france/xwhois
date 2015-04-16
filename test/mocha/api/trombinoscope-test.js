var assert = require('assert'),
    sinon = require('sinon'),
    confluence = require('../../../src/api/infrastructure/confluence'),
    trombinoscopeDb = require('../../../src/api/infrastructure/trombinoscopeDb'),
    trombinoscope = require('../../../src/api/trombinoscope');

describe('Trombinoscope Module Test', function () {
    var confluenceContentStub, confluenceAttachmentsStub, confluenceDownloadStub, trombinoscopeDbLastModifiedDateStub, trombinoscopeDbUpdatePersonStub, trombinoscopeDbUpdateLastModifiedDateStub, previousProcessEnvTITLE,

        assertThat = function (actual) {
            return {
                'hasName': function (expected, message) {
                    assert.strictEqual(actual['name'], expected, message === undefined ? 'person\'s name' : message);
                    return this;
                },
                'hasLastModificationDate': function (expected) {
                    assert.strictEqual(actual['lastModifiedDate'], expected, 'last modified date of image of parsed person');
                    return this;
                },
                'filenameIsUndefined': function () {
                    assert.strictEqual(actual['filename'], undefined, 'filename of image of parsed person');
                    return this;
                },
                'hrefIsUndefined': function () {
                    assert.strictEqual(actual['href'], undefined, 'href of image of parsed person');
                    return this;
                },
                'hasImageAsByteArray': function (buffer) {
                    assert(actual['imageAsByteArray'].equals(buffer), 'actual image as byte array is not equal to subbed content');
                    return this;
                },
                'hasContentType': function (expectedContentType) {
                    assert.strictEqual(actual['contentType'], expectedContentType, 'content type of image of parsed person');
                    return this;
                }
            };
        };

    beforeEach(function (done) {
        confluenceContentStub = sinon.stub(confluence, 'content');
        confluenceAttachmentsStub = sinon.stub(confluence, 'attachments');
        confluenceDownloadStub = sinon.stub(confluence, 'download');
        trombinoscopeDbLastModifiedDateStub = sinon.stub(trombinoscopeDb, 'getLastModifiedDate');
        trombinoscopeDbLastModifiedDateStub.returns(new Date(0));
        trombinoscopeDbUpdatePersonStub = sinon.stub(trombinoscopeDb, 'updatePerson');
        trombinoscopeDbUpdateLastModifiedDateStub = sinon.stub(trombinoscopeDb, 'updateLastModifiedDate');
        previousProcessEnvTITLE = process.env.TITLE;
        process.env.TITLE = 'Child1';
        done();
    });

    afterEach(function (done) {
        trombinoscope.reset();
        trombinoscopeDb.reset();
        confluenceContentStub.restore();
        confluenceAttachmentsStub.restore();
        confluenceDownloadStub.restore();
        trombinoscopeDbLastModifiedDateStub.restore();
        trombinoscopeDbUpdatePersonStub.restore();
        trombinoscopeDbUpdateLastModifiedDateStub.restore();
        if (previousProcessEnvTITLE === undefined) {
            delete process.env.TITLE;
        } else {
            process.env.TITLE = previousProcessEnvTITLE;
        }
        done();
    });

    it('should get list of users with their photos', function () {
        confluenceContentStub.yieldsOn(trombinoscope, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><content type="page" expand="space,children,comments,attachments,labels" id="4522409"><link rel="alternate" type="text/html" href="https://host/confluence/display/space"/><link rel="alternate" type="application/pdf" href="https://host/confluence/spaces/flyingpdf/pdfpageexport.action?pageId=1234"/><link rel="self" href="https://host/confluence/rest/prototype/1/content/1234"/><title>space</title><parentId>123</parentId><wikiLink>[space]</wikiLink><lastModifiedDate date="2015-02-24T15:21:57+0100" friendly="févr. 24, 2015"/><createdDate date="2007-10-04T17:28:09+0200" friendly="oct. 04, 2007"/><space type="space" title="space" name="space" key="space"><link rel="self" href="https://host/confluence/rest/prototype/1/space/space"/></space><children size="0"/><comments total="0"/><body type="2">&lt;ac:macro ac:name=&quot;info&quot;&gt;&lt;ac:rich-text-body&gt;Ta photo n\'est pas sur le trombi et tu ne sais pas comment l\'ajouter au bon format ? Envoie la &amp;agrave; &lt;a href=&quot;mailto:admin@host&quot;&gt;Administrateur&lt;/a&gt;.&lt;/ac:rich-text-body&gt;&lt;/ac:macro&gt;&lt;h1&gt;Title 1&lt;/h1&gt;&lt;table&gt;&lt;tbody&gt;&lt;tr&gt;&lt;td&gt;&lt;p&gt;&lt;ac:image ac:width=&quot;200&quot;&gt;&lt;ri:attachment ri:filename=&quot;file1.jpg&quot; /&gt;&lt;/ac:image&gt;&lt;/p&gt;&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;th&gt;&lt;p&gt;Firstname1 LASTNAME1&lt;/p&gt;&lt;/th&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td&gt;&lt;p&gt;Role 1&lt;/p&gt;&lt;/td&gt;&lt;/tr&gt;&lt;/tbody&gt;&lt;/table&gt;&lt;/table&gt;&lt;p&gt;&amp;nbsp;&lt;/p&gt;&lt;h1&gt;Title 6&lt;/h1&gt;&lt;table&gt;&lt;tbody&gt;&lt;tr&gt;&lt;td colspan=&quot;1&quot;&gt;&lt;ac:image&gt;&lt;ri:attachment ri:filename=&quot;file2.png&quot; /&gt;&lt;/ac:image&gt;&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;th colspan=&quot;1&quot;&gt;&lt;span style=&quot;color: rgb(0,51,102);&quot;&gt;Firs&amp;egrave;stname2 LAS- TNAME2&lt;/span&gt;&lt;/th&gt;&lt;/tr&gt;&lt;/tbody&gt;&lt;/table&gt;&lt;table&gt;&lt;tbody&gt;&lt;tr&gt;&lt;td&gt;&lt;p&gt;&lt;ac:image&gt;&lt;ri:attachment ri:filename=&quot;file3.jpg&quot; /&gt;&lt;/ac:image&gt;&lt;/p&gt;&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;th&gt;&lt;p&gt;Firstname (Firstn) LASTNAME3&lt;/p&gt;&lt;/th&gt;&lt;/tr&gt;&lt;/tbody&gt;&lt;/table&gt;&lt;table&gt;&lt;tbody&gt;&lt;tr&gt;&lt;td&gt;&lt;p&gt;&lt;ac:image&gt;&lt;ri:url ri:value=&quot;https://host/confluence/download/attachments/1234/file4.jpg?version=1&amp;amp;modificationDate=1387021227752&quot; /&gt;&lt;/ac:image&gt;&lt;/p&gt;&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;th&gt;&lt;p&gt;&lt;span style=&quot;color: rgb(0,51,102);&quot;&gt;Firstname4 LASTNAME4&lt;/span&gt;&lt;/p&gt;&lt;/th&gt;&lt;/tr&gt;&lt;/tbody&gt;&lt;/table&gt;&lt;p&gt;&amp;nbsp;&lt;/p&gt;&lt;p&gt;&amp;nbsp;&lt;/p&gt;&lt;p&gt;&amp;nbsp;&lt;/p&gt;&lt;p&gt;&amp;nbsp;&lt;/p&gt;&lt;/div&gt;&lt;p&gt;&amp;nbsp;&lt;/p&gt;</body><attachments size="323"/><labels><label name="label" namespace="global"/></labels><creator><links rel="self" href="https://host/confluence/rest/prototype/1/user/non-system/creatoruid"/><name>creatoruid</name><displayName>Creator</displayName><displayableEmail>nothing@provider.com</displayableEmail><anonymous>false</anonymous></creator><lastModifier><links rel="self" href="https://host/confluence/rest/prototype/1/user/non-system/lastmodifieruid"/><name>lastmodifieruid</name><displayName>Last Modifier UID</displayName><displayableEmail>lastmodifieruid@provider.com</displayableEmail><anonymous>false</anonymous></lastModifier></content>');
        confluenceAttachmentsStub.yields('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><attachments size="3" expand="attachment"><attachment iconClass="content-type-attachment-image" niceType="Image" version="1" niceFileSize="21 kB" fileSize="21524" contentType="image/jpeg" fileName="file1.jpg" type="attachment" id="55672963"><ownerId>4522409</ownerId><parentTitle>Title</parentTitle><link rel="self" href="https://host/confluence/rest/prototype/1/attachment/55672963"/><link rel="download" type="image/jpeg" href="https://host/confluence/download/attachments/1234/file1.jpg?version=1&amp;modificationDate=1424787636276"/><link rel="alternate" type="text/html" href="https://host/confluence/pages/viewpageattachments.action?pageId=1234&amp;highlight=file1#Title-attachment-file1.jpg"/><title>file1</title><thumbnailLink rel="thumbnail" href="https://host/confluence/download/thumbnails/1234/file1.jpg"/><thumbnailWidth>153</thumbnailWidth><thumbnailHeight>200</thumbnailHeight><wikiLink>[space:Title^file1.jpg]</wikiLink><space type="space" title="Space" name="Space" key="space"><link rel="self" href="https://host/confluence/rest/prototype/1/space/space"/></space><lastModifiedDate date="2015-02-24T15:20:36+0100" friendly="févr. 24, 2015"/><createdDate date="2015-02-24T15:20:36+0100" friendly="févr. 24, 2015"/></attachment><attachment contentType="image/png" fileName="file2.png"><link rel="download" href="https://host/confluence/download/attachments/1234/file2.png?version=1&amp;modificationDate=1404805554216"/><title>file2.jpg</title></attachment><attachment fileName="file3.jpg"><link rel="download" href="https://host/confluence/download/attachments/1234/file3.jpg?version=1&amp;modificationDate=1404464400260"/><title>file3.jpg</title></attachment></attachments>');
        confluenceDownloadStub.yields('jpeg...');

        trombinoscope.parsePeople();

        assertThat(trombinoscope.getPerson(0))
            .hasName('Firstname1 LASTNAME1')
            .hasLastModificationDate('2015-02-24T15:20:36+0100')
            .filenameIsUndefined()
            .hrefIsUndefined()
            .hasImageAsByteArray(new Buffer('jpeg...'))
            .hasContentType('image/jpeg')
        ;
        assert(trombinoscopeDbUpdatePersonStub.getCall(0).calledWithExactly(trombinoscope.getPerson(0)), 'first person should be updated to database');
        assertThat(trombinoscope.getPerson(1)).hasName('Firs&#xE8;stname2 LAS- TNAME2', 'name that contains html entity, space and minus').hasContentType('image/png');
        assertThat(trombinoscope.getPerson(2)).hasName('Firstname (Firstn) LASTNAME3', 'name that contains parenthesis');
        assertThat(trombinoscope.getPerson(3)).hrefIsUndefined();
        assert.strictEqual(trombinoscope.getPerson(4), undefined);
        assert(trombinoscopeDbUpdateLastModifiedDateStub.calledWithExactly(new Date('2015-02-24T15:21:57+0100')), 'once downloaded and parsed, last modified date from confluence shoulb be written to database');
    });

    it('should not update because last modified date from database is same as last modified date from confluence', function () {
        var lastModifiedDate = '1981-12-24T09:30:00+0100';
        trombinoscopeDbLastModifiedDateStub.returns(new Date(lastModifiedDate));
        confluenceContentStub.yieldsOn(trombinoscope, '<content><lastModifiedDate date="' + lastModifiedDate + '"/></content>');

        trombinoscope.parsePeople();

        assert.strictEqual(trombinoscope.getPerson(0), undefined);
    });
});
