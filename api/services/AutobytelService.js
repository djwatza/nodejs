//var easySoap = require('easysoap');
//https://github.com/vpulim/node-soap
var soap = require('soap');

module.exports =
{
    endpoints:{
        staging:"http://leadengine.services.staging.myride.com/LeadEngine/DropZone.asmx?wsdl",
        production:"http://leadengine.services.myride.com/LeadEngine/DropZone.asmx?wsdl"
    },
    _default:
    {
        lead:{
            ProspectID:0,
            RequestDate:null,
            Vehicle:{
                Status: "Used",
                VehicleID:null,
                Year:null,
                Make:null,
                Model:null,
                PreferedFinanceMethod:"Finance",
                DownPayment:0
            },
            Customer:{
                FirstName:null,
                LastName:null,
                Address1:null,
                City:null,
                State:null,
                ZipCode:null,
                HomePhone:null,
                EmailAddress:null,
                BestContactMethod:"Email",
                BestContactTime:"Evening",
                PurchaseTimeFrame:"Within14Days"
            },
            Provider:{
                ProviderID:32863
            }
        }
    },
    post:function(request, callback)
    {
        console.log("api request");
        console.log(request);

        var live = false;//(request.live) ? true:false;

        var _d = AutobytelService._default.lead;

        var vin = (UtilityService.empty(request.vin)) ? null : request.vin;
        var first_name = (UtilityService.empty(request.first_name)) ? null : request.first_name;
        var last_name = (UtilityService.empty(request.last_name)) ? null : request.last_name;
        var address = (UtilityService.empty(request.address)) ? null : request.address;
        var zip_code = (UtilityService.empty(request.zip_code)) ? null : request.zip_code;
        var email = (UtilityService.empty(request.email)) ? null : request.email;
        var phone = (UtilityService.empty(request.phone)) ? null : request.phone;
        var contact_method = (UtilityService.empty(request.contact_method)) ? _d.Customer.BestContactMethod : request.contact_method;
        var contact_time = (UtilityService.empty(request.contact_time)) ? _d.Customer.BestContactTime : request.contact_time;
        var purchase_timeframe = (UtilityService.empty(request.purchase_timeframe)) ? _d.Customer.PurchaseTimeFrame  : request.purchase_timeframe;
        var finance = (UtilityService.empty(request.finance_method)) ? _d.Vehicle.PreferedFinanceMethod : request.finance_method;

        //TODO: save lead anyway
        if(UtilityService.empty(vin))
            return callback("VIN is required");

        if(UtilityService.empty(zip_code))
            return callback("zip code is required");

        VehicleService.list({vin: vin}, function(err, data)
        {
            if(err)
                return callback(err);

            if(!data.hits || data.hits.length < 1)
                return callback("VIN is invalid");

            var vehicle = data.hits[0];

            ZipCode.findOne({id:zip_code, type:"zip_code"}, function(err2, zip_data)
            {
                if(err2)
                    return callback(err2);

                console.log(zip_data);

                var p = AutobytelService._default;

                p.lead.Vehicle.VehicleID = vehicle.vehicle_id;
                p.lead.Vehicle.Year = vehicle.year;
                p.lead.Vehicle.Make = vehicle.make;
                p.lead.Vehicle.Model = vehicle.model;
                p.lead.Vehicle.PreferedFinanceMethod = finance;
                p.lead.Customer.FirstName = first_name;
                p.lead.Customer.LastName = last_name;
                p.lead.Customer.Address1 = address;
                p.lead.Customer.City = zip_data.city;
                p.lead.Customer.State = zip_data.state;
                p.lead.Customer.ZipCode = zip_code;
                p.lead.Customer.EmailAddress = email;
                p.lead.Customer.HomePhone = phone;
                p.lead.Customer.BestContactMethod = contact_method;
                p.lead.Customer.BestContactTime = contact_time;
                p.lead.Customer.PurchaseTimeFrame = purchase_timeframe;

                p.lead.RequestDate = new Date().toISOString();

                var url = (live) ? AutobytelService.endpoints.production : AutobytelService.endpoints.staging;

                console.log("sending SOAP request to\n\t-> %s", url);
                console.log(p);


                soap.createClient(url,function(err, client) {

                    client.Post(p, function(err, result) {

                        if(err)
                            callback(err, null);

                        if(!result.PostResult.Accepted)
                        {
                            var e = {
                                message: "Lead API returned an error",
                                error: result.PostResult.Errors.Error
                            };

                           return callback(e, null);
                        }

                        console.log("SOAP result");
                        console.log(JSON.stringify(result));

                        callback(null, {success:true, lead_id:result.LeadID});

                    });
                });
            });
        });


    }
};