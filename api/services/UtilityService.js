module.exports =
{
    //http://54.69.100.173:8080/crop/400x300/http://ucimages.services.autobytel.com/cyber/216797/i4JGDA5HB6EA327436_1.jpg
    crop_url: function(url, height, width, operation)
    {
        var base_url = sails.config.autodealio.images.base_url;

        return base_url + operation + "/" + width + "x" + height + "/" + url;
    }
};