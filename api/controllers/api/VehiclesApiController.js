/**
 * CarsApiController
 *
 * @description :: REST API for querying cars
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports =
{
    post: function(req, res)
    {
        AutobytelService.post(req.body, function(err, data)
        {
            if (err)
                return res.serverError(err);

            res.jsonx(data);
        });
    },
    list: function (req, res)
    {
        VehicleService.list(req.query, function(err, data)
        {
            if (err)
                return res.serverError(err);

            res.jsonx(data);
        });
    }
};

