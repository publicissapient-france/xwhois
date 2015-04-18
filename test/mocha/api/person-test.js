var assert = require('assert'),
    person = require('../../../src/api/person');

describe("Person Module Test", function () {
    it('should replace plus to spaces into href', function () {
        var p = person('name');

        p.prepareDownloadByUrl('https://intarnet/confluence/download/attachments/1234/some+nice+image.jpg?version=1&modificationDate=1234');

        assert.strictEqual(p.getHref(), 'https://intarnet/confluence/download/attachments/1234/some%20nice%20image.jpg?version=1&modificationDate=1234');
    });
});
