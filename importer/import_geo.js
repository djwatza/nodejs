#!/usr/bin/env node

var mkdirp = require('mkdirp');
var admzip = require('adm-zip');    //  https://github.com/cthackers/adm-zip
var csv = require('fast-csv');
var elasticsearch = require('es');
var moment = require('moment');
var fs = require('fs');
var http = require('http');


var Importer =
{
    today:'',
    base:'./autobytel/',
    path:'',
    filepath:'',
    txtpath:'',
    url:'http://download.geonames.org/export/zip/US.zip',
    fn: 'zip_codes.zip',
    txtfn: 'US.txt',
    row_cursor:0,
    es:{},
    index:'vehicle',
    type:'zip_code',
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
            var stats = fs.statSync(Importer.filepath)

            console.log('local file exists: [%s] size is %sMB', Importer.filepath, Number((stats["size"] / 1000000.0).toFixed(2)));

            Importer.unzip_csv();
        }
        else
        {
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
            console.log("downloading geonames db to local [%s]", Importer.filepath);

            var file = fs.createWriteStream(Importer.filepath);
            var request = http.get(Importer.url, function(response) {
                response.pipe(file);

                file.on('finish', function()
                {
                    file.close(Importer.on_file_download);
                });

                file.on('error', function(err)
                {
                    fs.unlink(Importer.filepath); // Delete the file async. (But we don't check the result)

                    Importer.error_handler(err);
                });
            });
        }
    },
    on_file_download:function()
    {
        if(fs.existsSync(Importer.filepath))
        {
            var stats = fs.statSync(Importer.filepath)

            console.log("zip file downloaded. size is %sMB", Number((stats["size"] / 1000000.0).toFixed(2)));

            Importer.unzip_csv();
        }
        else
        {
            Importer.error_handler("download callback fired but the file does not exist!");
        }
    },
    unzip_csv:function()
    {
        var zip = new admzip(Importer.filepath);

        zip.extractAllTo(Importer.path, true);

        Importer.index_csv();
    },
    index_csv:function()
    {
        Importer.row_cursor = 0;

        Importer.es = elasticsearch({
            _index : Importer.index,
            _type : Importer.type,
            host : '54.148.1.144'
        });

        csv
            .fromPath(Importer.txtpath, {delimiter:"\t", headers:false, trim:true, quote:null})
            .transform(Importer.csv_row_transform)
            .on("data", Importer.on_csv_data)
            .on("error", Importer.on_csv_error)
            .on("end", Importer.on_csv_end);
    },
    csv_row_transform:function(data)
    {
        var row = {};

        row.country = data[0];
        row.zip_code = data[1];
        row.zip_string = data[1];
        row.city = data[2];
        row.state_name = data[3];
        row.state = data[4];
        row.region = data[5];
        row.code = data[6];
        row.latitude = data[9];
        row.longitude = data[10];
        row.pin =
        {
            location : {
                lat : row.latitude,
                lon : row.longitude
            }
        };

        return row;
    },
    on_csv_data:function(data)
    {
        console.log("%s. indexing zip [%s] - %s, %s", ++Importer.row_cursor, data.zip_code, data.city, data.state_name);

        Importer.es.request.on('error', function (err)
        {
            console.log("zip code indexing failed\n%s", JSON.stringify(err));
        });

        Importer.es.index({_index : Importer.index, _type : Importer.type, host : '54.148.1.144', _id: data.zip_code}, data, Importer.on_index);
    },

    on_csv_error:function(e)
    {
        Importer.error_handler(e);
    },
    on_csv_end:function()
    {
        console.log("CSV done");
    },
    on_index:function(err, data)
    {
        if(err)
        {
            console.log("zip code indexing failed\n%s", JSON.stringify(err));
        }
        else
        {
            console.log("indexing OK for zip [%s]", data._id);
        }
    }
}

Importer.initialize();