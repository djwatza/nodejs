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
            ProspectID:42,
            RequestDate:null,
            Vehicle:{
                Status: "Used",
                VehicleID:113902761,
                Year:2010,
                PreferedFinanceMethod:"Finance",
                DownPayment:2000
            },
            Customer:{
                FirstName:'Melina',
                LastName:'Rose',
                Address1:'8600 Falmouth Ave',
                City:'Playa Del Rey',
                State:'CA',
                ZipCode:90293,
                HomePhone:8185990644,
                EmailAddress:'melinarose11223@gmail.com',
                BestContactMethod:"HomePhone",
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
        var live = (UtilityService.empty(request.live)) ? false : true;

        var url = (live) ? AutobytelService.endpoints.production : AutobytelService.endpoints.staging;

        var p = AutobytelService._default;

        p.lead.RequestDate = new Date().toISOString();

        console.log("sending SOAP request to\n\t-> %s", url);
        console.log(p);

        soap.createClient(url,function(err, client) {

            client.Post(p, function(err, result) {

                if(err)
                    callback(err, null);

                console.log("SOAP result");
                console.log(JSON.stringify(result));

            });
        });
    }
};