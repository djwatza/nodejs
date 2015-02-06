/**
 * CarsApiController
 *
 * @description :: REST API for querying cars
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports =
{
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

