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
        Vehicle.findOne({ zip_code: req.params.zip, vehicle_id: req.params.vehicle_id }, function(err, vehicle)
        {
            console.log(err);
            console.log(vehicle);

            res.view("vehicle/view",
            {
                vehicle: vehicle
            });


        });
    }
};

