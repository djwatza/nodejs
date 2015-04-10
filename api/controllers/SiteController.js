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
        res.view("homepage",{
            current_page: "homepage",
            page_params: { }
        });
    },
    view: function (req, res)
    {
        console.log("view params");
        console.log(req.params);

        var vin = req.params.vin;

        if(vin.indexOf("-") != -1)
        {
            var tmp = vin.split("-");
            vin = tmp[tmp.length - 1];
            console.log(tmp);
        }

        console.log("parsed VIN >>> %s", vin);

        VehicleService.list({vin: vin}, function(err, data)
        {
            res.view("vehicle/view",{
                vehicle: data.hits[0],
                page_params:req.params,
                current_page: "view_vehicle"
            });
        });
    }
};

