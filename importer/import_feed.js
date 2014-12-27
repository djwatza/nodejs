#!/usr/bin/env node

var jsftp = require("jsftp");       //  https://www.npmjs.org/package/jsftp
var fs = require('fs');             //  https://www.npmjs.org/package/fs
var moment = require('moment');
var mkdirp = require('mkdirp');
var admzip = require('adm-zip');    //  https://github.com/cthackers/adm-zip
var csv = require('fast-csv');
var elasticsearch = require('es');
var trim = require('trim');
var yargs = require('yargs');

String.prototype.toUnderscore = function(){

    return this.replace(/([A-Z])/g, function($1){return "_"+$1.toLowerCase();});
};

var Importer =
{
    ftp : {},
    dl_file:{},
    today:'',
    fn:'UCInventory2094.zip',
    txtfn:'UCInventory2094.txt',
    base:'./autobytel/',
    path:'',
    filepath:'',
    txtpath:'',
    row_cursor:0,
    es:{},
    max_buffer:800,
    buffer:{},
    es_fired:0,
    es_err:0,
    es_done:0,
    error_handler: function(err)
    {
        console.log("there was an error -> [" + JSON.stringify(err, null, 2) + "]\nimporter failed, please try again...");

        return false;
    },
    initialize: function()
    {
        Importer.today = moment().format("YYYYMMDD");

        Importer.path = Importer.base + Importer.today + "/";

        Importer.filepath = Importer.path + Importer.fn;

        Importer.txtpath = Importer.path + Importer.txtfn;

        if(fs.existsSync(Importer.filepath))
        {
            console.log('local file exists: [%s]', Importer.filepath);

            Importer.on_ftp_get(false);
        }
        else
        {
            Importer.ftp = new jsftp({
                host: "leads.services.autobytel.com",
                user: "2094",
                pass: "Ftp4two094",
                debugMode: true
            });

            mkdirp(Importer.path, Importer.on_mkdirp);
        }

    },
    on_mkdirp : function(error)
    {
        if(error)
        {
            Importer.error_handler(error);
        }
        else
        {
            console.log("downloading used car feed to local [%s]", Importer.filepath);

            Importer.ftp.get(Importer.fn, Importer.filepath, Importer.on_ftp_get);
        }
    },
    on_ftp_get:function(error)
    {
        if (error)
            Importer.error_handler(error)
        else
        {
            console.log('attempting to unzip local file...');

            var zip = new admzip(Importer.filepath);
            var zipEntries = zip.getEntries();

            zipEntries.forEach(function(zipEntry)
            {
                console.log(zipEntry.toString()); // outputs zip entries information
            });

            zip.extractAllTo(Importer.path, true);

            Importer.row_cursor = 0;
            Importer.es_fired = 0;
            Importer.es_done = 0;
            Importer.es_err = 0;
            Importer.buffer = [];

            console.log('file unzipped. getting an elasticsearch client...');

            Importer.es = elasticsearch({
                _index : 'vehicle',
                _type : 'vehicle',
                host : '54.148.1.144'
            });

            console.log('elasticsearch is online. parsing csv file...');

            csv
                .fromPath(Importer.txtpath, {delimiter:"\t", headers:true, trim:true, quote:null})
                .transform(Importer.csv_row_transform)
                .on("data", Importer.on_csv_data)
                .on("error", Importer.on_csv_error)
                .on("end", Importer.on_csv_end)
        }
    },
    csv_row_transform:function(data)
    {
        var row = {};

        for(var attr in data)
        {
            row[attr.replace("ID", "Id").replace("VIN", "Vin").toUnderscore().substring(1)] = data[attr];
        }

        row.image_urls = data.ImageUrls.split("|");
        row.features = data.Features.split(",");
        row.today = Importer.today;

        for (index = 0; index < row.features.length; ++index)
        {
            row.features[index] = trim.left(row.features[index]);
        }

        return row;
    },
    on_csv_data:function(data)
    {
//        console.log("%s. (%s of %s) buffering vehicle [%s] - %s %s %s %s", ++Importer.row_cursor, Importer.buffer.length, Importer.max_buffer, data.vehicle_id, data.year, data.make, data.model, data.series);

        Importer.buffer.push
        (
            { index : { _index : 'vehicle', _type : 'vehicle', _id : data.vehicle_id, parent: data.zip_code } },
            data
        );

        if(Importer.buffer.length > Importer.max_buffer)
        {
            Importer.flush_buffer();
        }
    },
    on_csv_error:function(e)
    {
        console.log("ERROR: csv row failed\n%s", e);
    },
    on_csv_end:function()
    {
        console.log("CSV done.");

        Importer.flush_buffer();
    },
    flush_buffer:function()
    {
        ++Importer.es_fired;

        var rows = Importer.buffer;

        Importer.buffer = [];

        console.log("#%s. flush buffer -> [%s] rows",Importer.es_fired, rows.length);

        Importer.es.bulk({host : '54.148.1.144', timeout : 90000}, rows, Importer.on_bulk_index);
    },
    on_bulk_index:function(err, data)
    {
        ++Importer.es_done;

        if(err)
        {
            ++Importer.es_err;

            console.log("ERROR (%s) => bulk indexing failed\n%s", Importer.es_err, JSON.stringify(err));
        }
        else
        {
            console.log("(%s of %s) bulk indexing OK - [%s] items", Importer.es_done, Importer.es_fired, data.items.length);
        }

        if(Importer.es_done >= Importer.es_fired)
        {
            console.log("BULK INDEXING COMPLETE");
        }
    }
}

Importer.initialize();

/*
transformed:
{
    "vehicle_id": "111838463",
    "program_id": "2",
    "dealer_id": "270709",
    "zip_code": "46360",
    "radius": "40",
    "phone_number": "",
    "vin": "5FNRL5H67DB053709",
    "stock_number": "C1587P",
    "year": "2013",
    "make": "Honda",
    "model": "Odyssey",
    "series": "EX-L",
    "mileage": "16552",
    "price": "29400.00",
    "interior_color": "Gray",
    "exterior_color": "Alabaster Silver Metallic",
    "num_doors": "4",
    "num_cylinders": "6",
    "transmission_type": "AUTO",
    "certified_preowned": "0",
    "comments": "\"**LOCAL TRADE** and **CLEAN CARFAX**. Odyssey EX-L, 5-Speed Automatic, and Gray w/Leather Seat Trim. This gorgeous-looking 2013 Honda Odyssey is the one-owner van you have been looking to get your hands on. It is nicely equipped with features such as **CLEAN CARFAX**, **LOCAL TRADE**, 5-Speed Automatic, Gray w/Leather Seat Trim, Odyssey EX-L, 17\"\" x 7\"\" Alloy Wheels, 3rd row seats: split-bench, 4.31 Axle Ratio, 4-Wheel Disc Brakes, 7 Speakers, A/V remote, ABS brakes, Air Conditioning, AM/FM radio: XM, Anti-whiplash front head restraints, Auto-dimming Rear-View mirror, Automatic temperature control, Brake assist, Bumpers: body-color, CD player, Compass, Delay-off headlights, Driver door bin, Driver vanity mirror, Driver's Seat Mounted Armrest, Dual front impact airbags, Dual front side impact airbags, Electronic Stability Control, Entertainment system, First Aid Kit, Four wheel independent suspension, Front anti-roll bar, Front Bucket Seats, Front dual zone A/C, Front reading lights, Fully automatic headlights, Garage door transmitter: HomeLink, Headphones, Heated door mirrors, Heated Front Bucket Seats, Heated front seats, Illuminated entry, Leather Seat Trim, Leather Shift Knob, Low tire pressure warning, MP3 decoder, Occupant sensing airbag, Outside temperature display, Overhead airbag, Overhead console, Panic alarm, Passenger door bin, Passenger seat mounted armrest, Passenger vanity mirror, Power door mirrors, Power driver seat, Power moonroof, Power passenger seat, Power steering, Power windows, Radio data system, Radio: AM/FM/CD-Library 2GB Memory Audio System, Rear air conditioning, Rear audio controls, Rear reading lights, Rear seat center armrest, Rear window defroster, Rear window wiper, Reclining 3rd row seat, Remote keyless entry, Security system, Speed control, Speed-sensing steering, Speed-Sensitive Wipers, Split folding rear seat, Spoiler, Steering wheel mounted audio controls, Sun blinds, Tachometer, Telescoping steering wheel, Tilt steering wheel, Traction control, Trip computer, Variably intermittent wipers, and XM Radio. Honda has established itself as a name associated with quality. This Honda Odyssey will get you where you need to go for many years to come. It's Always BETTER at http://www.BosakHondaMC.com.\"",
    "features": [
        "\"7 Speakers",
        "AM/FM radio: XM",
        "CD player",
        "MP3 decoder",
        "Radio data system",
        "Radio: AM/FM/CD-Library 2GB Memory Audio System",
        "Rear audio controls",
        "XM Radio",
        "Air Conditioning",
        "Automatic temperature control",
        "Front dual zone A/C",
        "Rear air conditioning",
        "Rear window defroster",
        "Power driver seat",
        "Power steering",
        "Power windows",
        "Remote keyless entry",
        "Steering wheel mounted audio controls",
        "A/V remote",
        "Entertainment system",
        "Headphones",
        "Four wheel independent suspension",
        "Speed-sensing steering",
        "Traction control",
        "4-Wheel Disc Brakes",
        "ABS brakes",
        "Anti-whiplash front head restraints",
        "Dual front impact airbags",
        "Dual front side impact airbags",
        "Front anti-roll bar",
        "Low tire pressure warning",
        "Occupant sensing airbag",
        "Overhead airbag",
        "Power moonroof",
        "Brake assist",
        "Electronic Stability Control",
        "Delay-off headlights",
        "Fully automatic headlights",
        "First Aid Kit",
        "Panic alarm",
        "Security system",
        "Speed control",
        "Bumpers: body-color",
        "Heated door mirrors",
        "Power door mirrors",
        "Spoiler",
        "Auto-dimming Rear-View mirror",
        "Compass",
        "Driver door bin",
        "Driver vanity mirror",
        "Front reading lights",
        "Garage door transmitter: HomeLink",
        "Illuminated entry",
        "Leather Shift Knob",
        "Outside temperature display",
        "Overhead console",
        "Passenger seat mounted armrest",
        "Passenger vanity mirror",
        "Rear reading lights",
        "Rear seat center armrest",
        "Sun blinds",
        "Tachometer",
        "Telescoping steering wheel",
        "Tilt steering wheel",
        "Trip computer",
        "3rd row seats: split-bench",
        "Driver's Seat Mounted Armrest",
        "Front Bucket Seats",
        "Heated Front Bucket Seats",
        "Heated front seats",
        "Leather Seat Trim",
        "Power passenger seat",
        "Reclining 3rd row seat",
        "Split folding rear seat",
        "Passenger door bin",
        "17\"\" x 7\"\" Alloy Wheels",
        "Rear window wiper",
        "Speed-Sensitive Wipers",
        "Variably intermittent wipers",
        "4.31 Axle Ratio",
        "**LOCAL TRADE**",
        "**CLEAN CARFAX**\""
    ],
        "image_urls": [
        "http://ucimages.services.autobytel.com/cyber/270709/i5FNRL5H67DB053709_1.jpg",
        "http://ucimages.services.autobytel.com/cyber/270709/i5FNRL5H67DB053709_2.jpg",
        "http://ucimages.services.autobytel.com/cyber/270709/i5FNRL5H67DB053709_3.jpg",
        "http://ucimages.services.autobytel.com/cyber/270709/i5FNRL5H67DB053709_4.jpg",
        "http://ucimages.services.autobytel.com/cyber/270709/i5FNRL5H67DB053709_5.jpg",
        "http://ucimages.services.autobytel.com/cyber/270709/i5FNRL5H67DB053709_6.jpg",
        "http://ucimages.services.autobytel.com/cyber/270709/i5FNRL5H67DB053709_7.jpg",
        "http://ucimages.services.autobytel.com/cyber/270709/i5FNRL5H67DB053709_8.jpg",
        "http://ucimages.services.autobytel.com/cyber/270709/i5FNRL5H67DB053709_9.jpg",
        "http://ucimages.services.autobytel.com/cyber/270709/i5FNRL5H67DB053709_10.jpg",
        "http://ucimages.services.autobytel.com/cyber/270709/i5FNRL5H67DB053709_11.jpg",
        "http://ucimages.services.autobytel.com/cyber/270709/i5FNRL5H67DB053709_12.jpg",
        "http://ucimages.services.autobytel.com/cyber/270709/i5FNRL5H67DB053709_13.jpg",
        "http://ucimages.services.autobytel.com/cyber/270709/i5FNRL5H67DB053709_14.jpg",
        "http://ucimages.services.autobytel.com/cyber/270709/i5FNRL5H67DB053709_15.jpg",
        "http://ucimages.services.autobytel.com/cyber/270709/i5FNRL5H67DB053709_16.jpg",
        "http://ucimages.services.autobytel.com/cyber/270709/i5FNRL5H67DB053709_17.jpg",
        "http://ucimages.services.autobytel.com/cyber/270709/i5FNRL5H67DB053709_18.jpg",
        "http://ucimages.services.autobytel.com/cyber/270709/i5FNRL5H67DB053709_19.jpg",
        "http://ucimages.services.autobytel.com/cyber/270709/i5FNRL5H67DB053709_20.jpg",
        "http://ucimages.services.autobytel.com/cyber/270709/i5FNRL5H67DB053709_21.jpg",
        "http://ucimages.services.autobytel.com/cyber/270709/i5FNRL5H67DB053709_22.jpg",
        "http://ucimages.services.autobytel.com/cyber/270709/i5FNRL5H67DB053709_23.jpg",
        "http://ucimages.services.autobytel.com/cyber/270709/i5FNRL5H67DB053709_24.jpg",
        "http://ucimages.services.autobytel.com/cyber/270709/i5FNRL5H67DB053709_25.jpg"
    ],
    "city": "Michigan City",
    "state": "IN"
}

original:
{
    "VehicleID": "111861903",
    "ProgramID": "2",
    "DealerID": "289402",
    "ZipCode": "75087",
    "Radius": "50",
    "PhoneNumber": "",
    "VIN": "19XFB2F53DE047300",
    "StockNumber": "P047300",
    "Year": "2013",
    "Make": "Honda",
    "Model": "Civic",
    "Series": "LX",
    "Mileage": "37076",
    "Price": "15978.00",
    "InteriorColor": "Gray",
    "ExteriorColor": "Alabaster Silver Metallic",
    "NumDoors": "4",
    "NumCylinders": "4",
    "TransmissionType": "AUTO",
    "CertifiedPreowned": "0",
    "Comments": "\"ONE OWNER, 2013 CERTIFIED Honda Civic LX, 4D Sedan, FWD, Alabaster Silver Metallic, 15\"\" Wheels w/Full Covers, and Steering wheel mounted audio controls. <br><br>Wow! What a nice smaller car. This superb-looking and fun 2013 Honda Civic has a great ride and great power. I really enjoyed driving it. It's very clean, almost new, and really fun to drive. Honda Certified Pre-Owned means you not only get the reassurance of a 12mo/12,000 mile limited warranty, but also up to a 7yr/100k mile powertrain warranty, a 150-point inspection/reconditioning. Remarkable performance with exceptionally good fuel economy. This Civic is nicely equipped with features such as 15\"\" Wheels w/Full Covers, 4D Sedan, Alabaster Silver Metallic, Civic LX, CLEAN CARFAX, FWD, Honda Certified, ONE OWNER, Rear view Camera, and Steering wheel mounted audio controls. <br><br>PRICING FOR A LIMITED TIME ONLY!\"",
    "Features": "\"160-Watt AM/FM/CD Audio System, 4 Speakers, AM/FM radio, CD player, MP3 decoder, Radio data system, Air Conditioning, Rear window defroster, Power steering, Power windows, Remote keyless entry, Steering wheel mounted audio controls, Four wheel independent suspension, Speed-sensing steering, Traction control, ABS brakes, Dual front impact airbags, Dual front side impact airbags, Front anti-roll bar, Low tire pressure warning, Occupant sensing airbag, Overhead airbag, Rear anti-roll bar, Brake assist, Electronic Stability Control, Delay-off headlights, Panic alarm, Security system, Speed control, Bumpers: body-color, Power door mirrors, Cloth Seat Trim, Driver door bin, Driver vanity mirror, Front reading lights, Illuminated entry, Outside temperature display, Passenger vanity mirror, Tachometer, Telescoping steering wheel, Tilt steering wheel, Trip computer, Front Bucket Seats, Front Center Armrest, Reclining Front Bucket Seats, Passenger door bin, 15\"\" Wheels w/Full Covers, CLEAN CARFAX, ONE OWNER, Rear view Camera\"",
    "ImageUrls": "http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_1.jpg|http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_2.jpg|http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_3.jpg|http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_4.jpg|http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_5.jpg|http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_6.jpg|http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_7.jpg|http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_8.jpg|http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_9.jpg|http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_10.jpg|http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_11.jpg|http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_12.jpg|http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_13.jpg|http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_14.jpg|http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_15.jpg|http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_16.jpg|http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_17.jpg|http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_18.jpg|http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_19.jpg|http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_20.jpg|http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_21.jpg|http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_22.jpg|http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_23.jpg|http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_24.jpg|http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_25.jpg",
    "City": "Rockwall",
    "State": "TX",
    "images": [
        "http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_1.jpg",
        "http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_2.jpg",
        "http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_3.jpg",
        "http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_4.jpg",
        "http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_5.jpg",
        "http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_6.jpg",
        "http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_7.jpg",
        "http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_8.jpg",
        "http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_9.jpg",
        "http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_10.jpg",
        "http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_11.jpg",
        "http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_12.jpg",
        "http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_13.jpg",
        "http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_14.jpg",
        "http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_15.jpg",
        "http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_16.jpg",
        "http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_17.jpg",
        "http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_18.jpg",
        "http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_19.jpg",
        "http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_20.jpg",
        "http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_21.jpg",
        "http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_22.jpg",
        "http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_23.jpg",
        "http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_24.jpg",
        "http://ucimages.services.autobytel.com/cyber/289402/i19XFB2F53DE047300_25.jpg"
    ],
    "features": [
        "\"160-Watt AM/FM/CD Audio System",
        "4 Speakers",
        "AM/FM radio",
        "CD player",
        "MP3 decoder",
        "Radio data system",
        "Air Conditioning",
        "Rear window defroster",
        "Power steering",
        "Power windows",
        "Remote keyless entry",
        "Steering wheel mounted audio controls",
        "Four wheel independent suspension",
        "Speed-sensing steering",
        "Traction control",
        "ABS brakes",
        "Dual front impact airbags",
        "Dual front side impact airbags",
        "Front anti-roll bar",
        "Low tire pressure warning",
        "Occupant sensing airbag",
        "Overhead airbag",
        "Rear anti-roll bar",
        "Brake assist",
        "Electronic Stability Control",
        "Delay-off headlights",
        "Panic alarm",
        "Security system",
        "Speed control",
        "Bumpers: body-color",
        "Power door mirrors",
        "Cloth Seat Trim",
        "Driver door bin",
        "Driver vanity mirror",
        "Front reading lights",
        "Illuminated entry",
        "Outside temperature display",
        "Passenger vanity mirror",
        "Tachometer",
        "Telescoping steering wheel",
        "Tilt steering wheel",
        "Trip computer",
        "Front Bucket Seats",
        "Front Center Armrest",
        "Reclining Front Bucket Seats",
        "Passenger door bin",
        "15\"\" Wheels w/Full Covers",
        "CLEAN CARFAX",
        "ONE OWNER",
        "Rear view Camera\""
    ]
}
*/