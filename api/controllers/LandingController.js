/**
 * LandingController
 *
 * @description :: Server-side logic for landing pages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports =
{
    state: function (req, res)
    {
        res.send("state action ok");
    },
    city: function (req, res)
    {
        res.send("city action ok");
    },
    zip: function (req, res)
    {
        ZipCode.findOne({id:req.params.zip, type:"zip_code"}, function(err, zip_data)
        {
            if (err) {return res.serverError(err);}

            var zip = zip_data;

            var q =
            {
                "query": {
                    "match_all": {}
                },
                "filter": {
                    "term": {
                        "zip_code": zip.zip_code
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
        });
    }
};

