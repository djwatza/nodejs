module.exports =
{
    get_cities_by_state: function (state, callback)
    {
        var q = {
            "size":0,
            "aggs": {
                "state": {
                    "filter" :{
                        "term": {
                            "state": state.toUpperCase()
                        }
                    },
                    "aggs" :
                    {
                        "state_cities":
                        {
                            "terms": {
                                "field": "city",
                                "order" : { "_term" : "asc" },
                                size:200
                            }
                        }
                    }
                }
            }
        };

        Vehicle.search({body: q, type:"vehicle"}, function(err, data)
        {
            var cities_agg = data.aggregations;

            var cities = [];

            for (var i = 0, len = cities_agg.state.state_cities.buckets.length; i < len; i++)
            {
                var city = cities_agg.state.state_cities.buckets[i];

                cities.push({
                    city: city.key,
                    count: city.doc_count
                });
            }

            var ret = {
                hits: cities,
                total: cities_agg.state.doc_count
            };

            callback(null, ret);
        });
    }
};