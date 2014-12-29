/**
 * LandingController
 *
 * @description :: Server-side logic for landing pages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports =
{
    zip: function (req, res)
    {
        var zip = req.params.zip;

        var q =
        {
            "query": {
                "match_all": {}
            },
            "filter": {
                "term": {
                    "zip_code": zip
                }
            }
        };

        Vehicle.search({body:q, size: 15, from:0}, function(err, data)
        {
            if (err) {return res.serverError(err);}

            res.view("landing/zip",{
                vehicles: data,
                zip_code:zip
            });
        });
    }
};
