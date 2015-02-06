module.exports =
{
//  http://54.69.100.173:8080/crop/400x300/http://ucimages.services.autobytel.com/cyber/216797/i4JGDA5HB6EA327436_1.jpg
    crop_url: function(url, height, width, operation)
    {
        var base_url = sails.config.autodealio.images.base_url;

        return base_url + operation + "/" + width + "x" + height + "/" + url;
    },
//  http://stackoverflow.com/questions/4994201/is-object-empty
    empty: function (obj)
    {
    // null and undefined are "empty"
        if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
        if (obj.length && obj.length > 0) return false;
        if (obj.length === 0) return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and toValue enumeration bugs in IE < 9
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) return false;
        }

        return true;
    }
};