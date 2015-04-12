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
                    res.view("vehicle/view",{
                        vehicle: data.hits[0],
                        page_params:req.params,
                        current_page: "view_vehicle",
                        zip_data:zip_data
                    });
                });
            });
        }
        else
        {
            VehicleService.list({vin: vin}, function(err, data)
            {
                res.view("vehicle/view",{
                    vehicle: data.hits[0],
                    page_params:req.params,
                    current_page: "view_vehicle",
                    zip_data:null
                });
            });
        }
    }
};

