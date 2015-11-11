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
                    assert.strictEqual(actual.getName(), expected, message === undefined ? 'person\'s name' : message);
                    return this;
                },
                'hasLastModificationDate': function (expected) {
                    assert.strictEqual(actual.getLastModifiedDate(), expected, 'last modified date of image of parsed person');
                    return this;
                },
                'hrefIsUndefined': function () {
                    assert.strictEqual(actual.getHref(), undefined, 'href of image of parsed person');
                    return this;
                },
                'hasImage': function (buffer) {
                    assert(actual.getImage().equals(buffer), 'actual image as buffer is not equal to subbed content');
                    return this;
                },
                'hasContentType': function (expectedContentType) {
                    assert.strictEqual(actual.getContentType(), expectedContentType, 'content type of image of parsed person');
                    return this;
                }
            };
        };

    beforeEach(function (done) {
        confluenceContentStub = sinon.stub(confluence, 'content');
        confluenceAttachmentsStub = sinon.stub(confluence, 'attachments');
        confluenceDownloadStub = sinon.stub(confluence, 'download');
        trombinoscopeDbLastModifiedDateStub = sinon.stub(trombinoscopeDb, 'getLastModifiedDate');
        trombinoscopeDbLastModifiedDateStub.returns({
            'then': function (callback) {
                callback(new Date(0));
                return {
                    'fail': function () {
                    }
                };
            }
        });
        trombinoscopeDbUpdatePersonStub = sinon.stub(trombinoscopeDb, 'updatePerson');
        trombinoscopeDbUpdateLastModifiedDateStub = sinon.stub(trombinoscopeDb, 'updateLastModifiedDate');
        previousProcessEnvTITLE = process.env.TITLE;
        process.env.TITLE = 'Child1';
        done();
    });

    afterEach(function (done) {
        trombinoscope.reset();
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
        confluenceContentStub.yieldsOn(trombinoscope, '{"id":"1234","type":"page","status":"current","title":"title","version":{"by":{"type":"known","profilePicture":{"path":"/s/en_GB/5987/7f4d200af80c8d2bb74491844d32cdca053c56a4.3/_/download/attachments/4915287/user-avatar?version=1&modificationDate=1446570788000&api=v2","width":48,"height":48,"isDefault":false},"username":"user","displayName":"User","userKey":"d51e4ea250cd4f6e0150cd7aa52100f0"},"when":"2015-02-24T15:21:57.000+01:00","message":"new photo","number":417,"minorEdit":false},"body":{"view":{"value":"<div class=\\\"confluence-information-macro confluence-information-macro-information\\\"><span class=\\\"aui-icon aui-icon-small aui-iconfont-info confluence-information-macro-icon\\\"></span><div class=\\\"confluence-information-macro-body\\\">Ta photo n\'est pas sur le trombi et tu ne sais pas comment l\'ajouter au bon format ? Envoie la à <a class=\\\"external-link\\\" href=\\\"mailto:admin@host\\\" rel=\\\"nofollow\\\">Administrateur</a>.</div></div><h1 id=\\\"title-1\\\">Title 1</h1><div class=\\\"table-wrap\\\"><table class=\\\"confluenceTable\\\"><tbody><tr><td class=\\\"confluenceTd\\\"><p><span class=\\\"confluence-embedded-file-wrapper confluence-embedded-manual-size\\\"><img class=\\\"confluence-embedded-image\\\" width=\\\"200\\\" src=\\\"/download/attachments/1234/file1.jpg?version=1&amp;modificationDate=1317907672000&amp;api=v2\\\" data-image-src=\\\"/download/attachments/1234/file1.jpg?version=1&amp;modificationDate=1317907672000&amp;api=v2\\\" data-unresolved-comment-count=\\\"0\\\" data-linked-resource-id=\\\"4066191\\\" data-linked-resource-version=\\\"1\\\" data-linked-resource-type=\\\"attachment\\\" data-linked-resource-default-alias=\\\"file1.jpg\\\" data-base-url=\\\"https://host\\\" data-linked-resource-content-type=\\\"image/jpeg\\\" data-linked-resource-container-id=\\\"1234\\\" data-linked-resource-container-version=\\\"417\\\"></span></p></td></tr><tr><th class=\\\"confluenceTh\\\"><p>Firstname1 LASTNAME1</p></th></tr><tr><td class=\\\"confluenceTd\\\"><p>Role 1</p></td></tr></tbody></table></div><h1 id=\\\"title-6\\\">Title 6</h1><div class=\\\"table-wrap\\\"><table class=\\\"confluenceTable\\\"><tbody><tr><td colspan=\\\"1\\\" class=\\\"confluenceTd\\\"><span class=\\\"confluence-embedded-file-wrapper confluence-embedded-manual-size\\\"><img class=\\\"confluence-embedded-image\\\" width=\\\"200\\\" src=\\\"/download/attachments/1234/file2.png?version=2&amp;modificationDate=1342030126000&amp;api=v2\\\" data-image-src=\\\"/download/attachments/1234/file2.png?version=2&amp;modificationDate=1342030126000&amp;api=v2\\\" data-unresolved-comment-count=\\\"0\\\" data-linked-resource-id=\\\"4066152\\\" data-linked-resource-version=\\\"2\\\" data-linked-resource-type=\\\"attachment\\\" data-linked-resource-default-alias=\\\"file2.png\\\" data-base-url=\\\"https://host\\\" data-linked-resource-content-type=\\\"image/jpeg\\\" data-linked-resource-container-id=\\\"1234\\\" data-linked-resource-container-version=\\\"417\\\"></span></td></tr><tr><th colspan=\\\"1\\\" class=\\\"confluenceTh\\\"><p>Firsèstname2 LAS- TNAME2</p></th></tr><tr><td class=\\\"confluenceTd\\\"><p><span class=\\\"confluence-embedded-file-wrapper confluence-embedded-manual-size\\\"><img class=\\\"confluence-embedded-image\\\" width=\\\"200\\\" src=\\\"/download/attachments/1234/file3.jpg?version=2&amp;modificationDate=1320833410000&amp;api=v2\\\" data-image-src=\\\"/download/attachments/1234/file3.jpg?version=2&amp;modificationDate=1320833410000&amp;api=v2\\\" data-unresolved-comment-count=\\\"0\\\" data-linked-resource-id=\\\"4066040\\\" data-linked-resource-version=\\\"2\\\" data-linked-resource-type=\\\"attachment\\\" data-linked-resource-default-alias=\\\"file3.jpg\\\" data-base-url=\\\"https://host\\\" data-linked-resource-content-type=\\\"image/jpeg\\\" data-linked-resource-container-id=\\\"1234\\\" data-linked-resource-container-version=\\\"417\\\"></span></p></td></tr><tr><th class=\\\"confluenceTh\\\"><p>Firstname (Firstn) LASTNAME3</p></th></tr></tbody></table></div><div class=\\\"table-wrap\\\"><table class=\\\"confluenceTable\\\"><tbody><tr><td class=\\\"confluenceTd\\\"><p><span class=\\\"confluence-embedded-file-wrapper confluence-embedded-manual-size\\\"><img class=\\\"confluence-embedded-image\\\" width=\\\"200\\\" src=\\\"/download/attachments/1234/file4.jpg?version=1&amp;modificationDate=1279627591000&amp;api=v2\\\" data-image-src=\\\"/download/attachments/1234/file4.jpg?version=1&amp;modificationDate=1279627591000&amp;api=v2\\\" data-unresolved-comment-count=\\\"0\\\" data-linked-resource-id=\\\"4065344\\\" data-linked-resource-version=\\\"1\\\" data-linked-resource-type=\\\"attachment\\\" data-linked-resource-default-alias=\\\"file4.jpg\\\" data-base-url=\\\"https://host\\\" data-linked-resource-content-type=\\\"image/png\\\" data-linked-resource-container-id=\\\"1234\\\" data-linked-resource-container-version=\\\"417\\\"></span></p></td></tr><tr><th class=\\\"confluenceTh\\\"><p><span style=\\\"color: rgb(0,51,102);\\\">Firstname4 LASTNAME4</span></p></th></tr></tbody></table></div><p> </p><p> </p><p> </p><p><br /><br /></p><p> </p><p> </p>","representation":"view","_expandable":{"content":"/rest/api/content/1234"}},"_expandable":{"editor":"","export_view":"","storage":"","anonymous_export_view":""}},"extensions":{"position":"none"},"_links":{"webui":"/display/space-id/title","tinyui":"/x/owA_/","collection":"/rest/api/content","base":"https://host","context":"","self":"https://host/rest/api/content/1234"},"_expandable":{"container":"","metadata":"","operations":"","children":"/rest/api/content/1234/child","history":"/rest/api/content/1234/history","ancestors":"","descendants":"/rest/api/content/1234/descendant","space":"/rest/api/space/space-id"}}');
        confluenceAttachmentsStub.yields('{"results":[{"id":"att4065730","type":"attachment","status":"current","title":"file1","version":{"by":{"type":"known","profilePicture":{"path":"/s/en_GB/5987/7f4d200af80c8d2bb74491844d32cdca053c56a4.3/_/download/attachments/4915287/user-avatar?version=1&modificationDate=1446570788000&api=v2","width":48,"height":48,"isDefault":false},"username":"user","displayName":"User","userKey":"d51e4ea250cd4f6e0150cd7aa52100f0"},"when":"2015-02-24T15:20:36.000+01:00","message":"","number":1,"minorEdit":false},"metadata":{"mediaType":"image/jpeg","comment":""},"extensions":{"mediaType":"image/jpeg","comment":""},"_links":{"webui":"/display/space/Title?preview=%2F1234%2F4065730%2Ffile1.jpg","download":"/download/attachments/1234/file1.jpg?version=1&modificationDate=1317907672000&api=v2","self":"https://host/rest/api/content/att4065730"},"_expandable":{"container":"","operations":"","children":"/rest/api/content/att4065730/child","history":"/rest/api/content/att4065730/history","ancestors":"","body":"","descendants":"/rest/api/content/att4065730/descendant","space":"/rest/api/space/corporate"}},{"title":"file2.jpg","version":{"when":"2015-02-24T15:20:36.000+01:00"},"metadata":{"mediaType":"image/png"},"_links":{"download":"/download/attachments/1234/file2.png?version=2&modificationDate=1342030126000&api=v2"}},{"title":"file3.jpg","version":{"when":"2015-02-24T15:20:36.000+01:00"},"_links":{"download":"/download/attachments/1234/file3.jpg?version=2&modificationDate=1320833410000&api=v2"},"metadata":{"mediaType":"image/jpeg"}}]}');
        confluenceDownloadStub.yields(new Buffer('jpeg...'));
        trombinoscopeDbUpdatePersonStub.returns({
            'then': function (callback) {
                callback();
                return {
                    'fail': function () {
                    }
                };
            }
        });

        trombinoscope.parsePeople();

        assertThat(trombinoscope.getPerson(0))
            .hasName('Firstname1 LASTNAME1')
            .hasLastModificationDate('2015-02-24T15:20:36.000+01:00')
            .hrefIsUndefined()
            .hasImage(new Buffer('jpeg...'))
            .hasContentType('image/jpeg');
        assert(trombinoscopeDbUpdatePersonStub.getCall(0).calledWithExactly(trombinoscope.getPerson(0).exportToJSON()), 'first person should be updated to database');
        assertThat(trombinoscope.getPerson(1)).hasName('Firsèstname2 LAS- TNAME2', 'name that contains html entity, space and minus').hasContentType('image/png');
        assertThat(trombinoscope.getPerson(2)).hasName('Firstname (Firstn) LASTNAME3', 'name that contains parenthesis');
        assertThat(trombinoscope.getPerson(3)).hrefIsUndefined();
        assert.strictEqual(trombinoscope.getPerson(4), undefined);
        assert(trombinoscopeDbUpdateLastModifiedDateStub.calledWithExactly(new Date('2015-02-24T15:21:57+0100')), 'once downloaded and parsed, last modified date from confluence shoulb be written to database');
    });

    it('should filter empty column', function () {
        var emptyColumnImage = '<td class=\\\"confluenceTd\\\"> </td>',
            emptyColumnName = '<th class=\\\"confluenceTh\\\"><p> </p></th>';
        confluenceContentStub.yieldsOn(trombinoscope, '{"version":{"when":"2015-02-24T15:21:57.000+01:00"},"body":{"view":{"value":"<div class=\\\"table-wrap\\\"><table class=\\\"confluenceTable\\\"><tbody><tr>' + emptyColumnImage + '</tr><tr>' + emptyColumnName + '</tr></tbody></table></div>"}}}');

        trombinoscope.parsePeople();

        assert.strictEqual(trombinoscope.getPerson(0), undefined);
    });

    it('should ignore br html tag', function () {
        var nameWithBrHtmlTag = '<th class=\\\"confluenceTh\\\"><span style=\\\"color: rgb(0,51,102);\\\"><span style=\\\"color: rgb(0,51,102);\\\">Firstname LASTNAME</span><br /></span></th>';
        confluenceContentStub.yieldsOn(trombinoscope, '{"version":{"when":"2015-02-24T15:21:57.000+01:00"},"body":{"view":{"value":"<div class=\\\"table-wrap\\\"><table class=\\\"confluenceTable\\\"><tbody><tr>' + nameWithBrHtmlTag + '</tr></tbody></table></div>"}}}');

        trombinoscope.parsePeople();

        assertThat(trombinoscope.getPerson(0)).hasName('Firstname LASTNAME', 'name that contains br html tag');
    });

    it('should not update because last modified date from database is same as last modified date from confluence', function () {
        var lastModifiedDate = '1981-12-24T09:30:00.000+0100';
        trombinoscopeDbLastModifiedDateStub.returns({
            'then': function (callback) {
                callback(new Date(lastModifiedDate));
                return {
                    'fail': function () {
                    }
                }
            }
        });
        confluenceContentStub.yieldsOn(trombinoscope, '{"version": {"when": "' + lastModifiedDate + '"}}');

        trombinoscope.parsePeople();

        assert.strictEqual(trombinoscope.getPerson(0), undefined);
    });

    it('should not fail even if last modified date from database is undefined', function () {
        trombinoscopeDbLastModifiedDateStub.returns({
            'then': function (callback) {
                callback();
                return {
                    'fail': function () {
                    }
                }
            }
        });
        confluenceContentStub.yieldsOn(trombinoscope, '{"version": {"when": "1981-12-24T09:30:00.000+0100"}}');

        trombinoscope.parsePeople();

        assert.strictEqual(trombinoscope.getPerson(0), undefined);
    });
});
