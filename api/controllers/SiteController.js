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

        //var q =
        //{
        //    query:
        //    {
        //        function_score :
        //        {
        //            query :
        //            {
        //                match_all: {}
        //            },
        //            random_score : {}
        //        }
        //    }
        //};

        var q =
        {
            size:0,
            "aggs": {
                "zip_code": {
                    "terms": {
                        "field": "state_name",
                        "order" : { "_term" : "asc" },
                        size:50
                    },
                    "aggs": {
                        "vehicle_children": {
                            "children": {
                                "type": "vehicle"
                            },
                            "aggs": {
                                "vehicle_count": {
                                    "terms": {
                                        "field": "vehicle._id"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        Vehicle.search({body: q, type:"zip_code"}, function(err, data)
        {
            var states = data.aggregations;

            res.view("homepage",{
                states:states.zip_code.buckets
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

