/**
 * LandingController
 *
 * @description :: Server-side logic for landing pages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports =
{
    search: function (req, res)
    {
        if(req.query.zip.length >= 5)
        {
            res.cookie(sails.config.autodealio.cookie_name, { zip:req.query.zip });
        }

        res.view("landing/search",{
            current_page: "landing_search",
            page_params: req.query
        });
    },
    state: function (req, res)
    {
        res.view("landing/state",{
            current_page: "landing_state",
            meta_title: "Used Cars for Sale in " +  req.params.state,
            meta_description: "Browse the Used Car Listings from Hundreds of Dealers in " + req.params.state + ". Narrow your Search by Zip Code to find the Closest Vehicles for Sale in your City.",
            page_params: {
                state: req.params.state
            }
        });
    },
    city: function (req, res)
    {
        var zip = (req.query.zip) ? req.query.zip : null;

        res.view("landing/city",{
            current_page: "landing_city",
            meta_title: "Used Cars for Sale in " +  req.params.city.fromSlug() + ", " + req.params.state,
            meta_description: "Looking to buy a Used Car in " +  req.params.city.fromSlug() + ", " + req.params.state + "? Search though our Inventory of Hundreds of Vehicles for Sale from Multiple Dealers in your Area.",
            page_params: {
                state: req.params.state,
                city: req.params.city,
                zip:zip
            }
        });
    },
    make: function (req, res)
    {
        res.view("landing/make",{
            current_page: "landing_make",
            meta_title: "Used " +  req.params.make.fromSlug() + " Cars for Sale in " +  req.params.city.fromSlug() + ", " + req.params.state,
            meta_description:"",
            page_params: {
                state: req.params.state,
                city: req.params.city,
                make: req.params.make
            }
        });
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
                    zip_code:zip,
                    current_page: "landing_zip",
                    page_params:{}
                });
            });
        });
    }
};

