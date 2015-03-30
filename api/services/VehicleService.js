module.exports =
{
    list: function(params, callback)
    {
        var zip = (UtilityService.empty(params.zip)) ? null : params.zip;

        if(UtilityService.empty(zip))
        {
            VehicleService._query(params, callback);
        }
        else
        {
            ZipCode.findOne({id:zip, type:"zip_code"}, function(err, zip_data)
            {
                params.lat = zip_data.pin.location.lat;
                params.lon = zip_data.pin.location.lon;

                VehicleService._query(params, callback);
            });
        }
    },
    _query: function(params, callback)
    {
        var state = (UtilityService.empty(params.state)) ? null : params.state;
        var city = (UtilityService.empty(params.city)) ? null : params.city;
        var make = (UtilityService.empty(params.make)) ? null : params.make;
        var category = (UtilityService.empty(params.category)) ? null : params.category;
        var vin = (UtilityService.empty(params.vin)) ? null : params.vin;
        var page = (UtilityService.empty(params.page)) ? 1 : params.page;
        var count = (UtilityService.empty(params.count)) ? 10 : params.count;
        var random = (UtilityService.empty(params.random) || "true" != params.random) ? false : true;
        var lat = (UtilityService.empty(params.lat)) ? null : params.lat
        var lon = (UtilityService.empty(params.lon)) ? null : params.lon;
        var radius = (UtilityService.empty(params.radius)) ? 50 : params.radius;
        var sort = (UtilityService.empty(params.sort)) ? 'default' : params.sort;

        if(random)
        {
            var q = {
                "query": {
                    "function_score" : {
                        "query": {
                            "match_all": {}
                        },
                        "random_score" : {}
                    }
                }
            };
        }
        else
        {
            var q ={
                "query": {
                    "match_all": {}
                }
            };
        }

        q.filter = {
            "bool" : {
                "must" : [
                    {
                        "range": {
                            "today": {
                                "gte": UtilityService.today()
                            }
                        }
                    }
                ]
            }
        };

        q.sort = [];

        var geo_filter = false;

        if(!UtilityService.empty(lat) && !UtilityService.empty(lon))
        {
            geo_filter = {
                "geo_distance": {
                    "distance": radius + "mi",
                    "pin.location": {
                        "lat": lat,
                        "lon": lon
                    }
                }
            };

            q.filter.bool.must.push(geo_filter);

            q.sort.push
            ({
                "_geo_distance": {
                    "location": {
                        "lat": lat,
                        "lon": lon
                    },
                    "order": "asc",
                    "unit": "mi",
                    "distance_type": "sloppy_arc"
                }
            });
        }

        if(!UtilityService.empty(state))
        {
            q.filter.bool.must.push
            ({
                "term": {
                    "state": state
                }
            });
        }

        if(!UtilityService.empty(vin))
        {
            q.filter.bool.must.push
            ({
                "term": {
                    "vin": vin
                }
            });
        }

        if(!UtilityService.empty(make))
        {
            q.filter.bool.must.push
            ({
                "term": {
                    "make": make
                }
            });
        }

        if(!UtilityService.empty(city))
        {
            if(UtilityService.empty(state))
             return callback("You must send a state in addition to city", null);

            q.filter.bool.must.push
            ({
                "term": {
                    "city": city
                }
            });
        }

        var base_agg =
        {
            "makes": {
                "terms": {
                    "field": "make",
                    "order": {
                        "_term": "asc"
                    },
                    "size": 10
                },
                "aggs": {
                    "models": {
                        "terms": {
                            "field": "model",
                            "order": {
                                "_term": "asc"
                            },
                            "size": 20
                        }
                    }
                }
            }
        };

        if(false == geo_filter)
        {
            q.aggs = base_agg;
        }
        else
        {
            q.aggs = {
                "location": {
                    "filter": geo_filter,
                    "aggs": base_agg
                }
            };
        }

        console.log("ES query\n%s", JSON.stringify(q));

        Vehicle.search({body: q, page: page, count: count}, function(err, data)
        {
            if(err)
                return callback(err, null);

            if(UtilityService.empty(data.aggregations))
                return callback(null, data);

            var buckets = (UtilityService.empty(data.aggregations.location)) ? data.aggregations.makes.buckets : data.aggregations.location.makes.buckets;

            var makes = [];

            for (var i = 0; i < buckets.length; i++) {

                var make = {
                    name:buckets[i].key,
                    count: buckets[i].doc_count,
                    models:[]
                };

                var model_buckets = buckets[i].models.buckets;

                for (var x = 0; x < model_buckets.length; x++) {

                    make.models.push({
                        name: model_buckets[x].key,
                        count: model_buckets[x].doc_count
                    });
                }

                makes[i] = make;
            }

            data.aggregations = {
                makes: makes
            };

            return callback(null, data);
        });
    },
    get_vehicle_by_zip_and_id: function(zip, id, callback)
    {
        ElasticsearchService.client().get
        (
            {_index : 'vehicle',_type : 'vehicle',host : ElasticsearchService.host, _id:id, parent:zip},
            callback
        );
    },
    get_random: function(count, callback)
    {
        ElasticsearchService.client().search
        (
            {_index : 'vehicle',_type : 'vehicle',host : ElasticsearchService.host, from: 0, size:count},
            {
                query:
                {
                    function_score :
                    {
                        query :
                        {
                            match_all: {}
                        },
                        random_score : {}
                    }
                }
            },
            callback
        );
    }
};


/*
 GETvehicle/vehicle/_search{
 "query": {
 "match_all": {

 }
 },
 "filter": {
 "bool": {
 "must": [
 {
 "geo_distance": {
 "distance": "50mi",
 "pin.location": {
 "lat": "43.1317",
 "lon": "-77.6062"
 }
 }
 }
 ]
 }
 },
 "sort": [
 {
 "_geo_distance": {
 "location": {
 "lat": "43.1317",
 "lon": "-77.6062"
 },
 "order": "asc",
 "unit": "mi",
 "distance_type": "sloppy_arc"
 }
 }
 ],
 "aggs": {
 "location": {
 "filter": {
 "geo_distance": {
 "distance": "50mi",
 "pin.location": {
 "lat": "43.1317",
 "lon": "-77.6062"
 }
 }
 },
 "aggs": {
 "makes": {
 "terms": {
 "field": "make",
 "order": {
 "_term": "asc"
 },
 "size": 50
 },
 "aggs": {
 "models": {
 "terms": {
 "field": "model",
 "order": {
 "_term": "asc"
 },
 "size": 20
 }
 }
 }
 }
 }
 }
 }
 }
* */


/*
    count vehicles by zip code:
* GET vehicle/_search?search_type=count
 {
 "aggs": {
 "zip_code": {
 "terms": {
 "field": "zip_code"
 },
 "aggs": {
 "vehicle_children": {
 "children": {
 "type": "vehicle"
 },
 "aggs": {
 "vehicle_count": {
 "terms": {
 "field": "vehicle._id"
 }
 }
 }
 }
 }
 }
 }
 }
* */
