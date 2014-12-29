/**
 * VehicleController
 *
 * @description :: Server-side logic for managing vehicles
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports =
{
    index: function (req, res)
    {
        if('POST' == req.originalMethod)
        {
            if(typeof req.body.zip_code != 'undefined' && req.body.zip_code.length)
            {
                res.redirect(req.body.zip_code);
            }
        }

        var q =
        {
            query:
            {
                function_score :
                {
                    query :
                    {
                        match_all: {}
                    },
                    random_score : {}
                }
            }
        };

        Vehicle.search({body: q, size:15, from:0}, function(err, data)
        {
            res.view("homepage",{
                vehicles: data
            });
        });
    },
    view: function (req, res)
    {
        Vehicle.findOne({parent_id: req.params.zip, id:req.params.vehicle_id}, function(err, data)
        {
            res.view("vehicle/view",{
                vehicle: data
            });
        });
    }
};

