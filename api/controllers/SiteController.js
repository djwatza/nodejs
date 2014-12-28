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
        VehicleService.get_random(15, function(err, data)
        {
            res.view("homepage",{
                vehicles: data.hits
            });
        });
    },
    view: function (req, res)
    {
        VehicleService.get_vehicle_by_zip_and_id(req.params.zip, req.params.vehicle_id, function(err, data)
        {
            res.view("vehicle/view",{
                vehicle: data._source
            });
        });
    }
};

