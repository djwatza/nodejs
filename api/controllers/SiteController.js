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
        var vin = req.params.vin;

        if(vin.indexOf("-") != -1)
        {
            var tmp = vin.split("-");
            vin = tmp[tmp.length - 1];
        }

        var zip_cookie = req.cookies[sails.config.autodealio.cookie_name];

        if(zip_cookie)
        {
            var zip_data = null;

            ZipCode.findOne({id:zip_cookie.zip, type:"zip_code"}, function(err, zip_data)
            {
                console.log("found zip code from cookie: %s", zip_cookie.zip);
                console.log(zip_data);

                VehicleService.list({vin: vin}, function(err, data)
                {
                    var vehicle = data.hits[0];

                    res.view("vehicle/view",{
                        vehicle: vehicle,
                        page_params:req.params,
                        current_page: "view_vehicle",
                        zip_data:zip_data,
                        meta_title:"Used " + vehicle.year + " " + vehicle.make + " " + vehicle.model + " " + vehicle.series + " for Sale in " + vehicle.city + ", " + vehicle.state + " - " + vehicle.vin,
                        meta_description:"Check out this " + vehicle.year + " " + vehicle.make + " " + vehicle.model + " " + vehicle.series + " for Sale in " + vehicle.city + ". This Vehicle is " + vehicle.exterior_color + " in Color, the Price is $" + vehicle.price + ", and the Mileage is " + vehicle.mileage + "."
                    });
                });
            });
        }
        else
        {
            VehicleService.list({vin: vin}, function(err, data)
            {
                if(data && data.hits && data.hits.length > 0)
                {
                    var vehicle = data.hits[0];

                    res.view("vehicle/view",{
                        vehicle:vehicle,
                        page_params:req.params,
                        current_page: "view_vehicle",
                        zip_data:null,
                        meta_title:"Used " + vehicle.year + " " + vehicle.make + " " + vehicle.model + " " + vehicle.series + " for Sale in " + vehicle.city + ", " + vehicle.state + " - " + vehicle.vin,
                        meta_description:"Check out this " + vehicle.year + " " + vehicle.make + " " + vehicle.model + " " + vehicle.series + " for Sale in " + vehicle.city + ". This Vehicle is " + vehicle.exterior_color + " in Color, the Price is $" + vehicle.price + ", and the Mileage is " + vehicle.mileage + "."
                    });
                }
                else
                {
                    console.error("problem loading vehicle data:", data);

                    res.notFound();
                }
            });
        }
    }
};

