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

module.exports = function (nameAsHtml) {
    var name = sanitize(nameAsHtml),
        filename,
        href,
        image,
        lastModifiedDate,
        contentType,
        setHref = function (href_) {
            href = href_.replace(/\+/g, '%20');
        };

    return {
        'getName': function () {
            return name;
        },

        'getFilename': function () {
            return filename;
        },

        'setFilename': function (filename_) {
            filename = filename_;
        },

        'getHref': function () {
            return href;
        },

        'prepareDownloadByUrl': function (href) {
            setHref(href);
        },

        'getImage': function () {
            return image;
        },

        'isReadyToDownload': function () {
            return href !== undefined;
        },

        'downloaded': function (image_) {
            image = image_;
            href = undefined;
        },

        'getLastModifiedDate': function () {
            return lastModifiedDate;
        },

        'getContentType': function () {
            return contentType;
        },

        'prepareDownloadByAttachment': function (contentType_, href, lastModifiedDate_) {
            filename = undefined;
            contentType = contentType_;
            setHref(href);
            lastModifiedDate = lastModifiedDate_;
        },

        'export': function () {
            return {
                'name': name,
                'image': image,
                'contentType': contentType,
                'lastModifiedDate': lastModifiedDate
            };
        }
    };
};
