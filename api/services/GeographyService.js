module.exports =
{
    get_states: function(callback)
    {
        var q = {
            "size": 0,
            "aggs": {
                "states": {
                    "terms": {
                        "field": "state",
                        "order": {
                            "_term": "asc"
                        },
                        "size": 200
                    }
                }
            }
        };

        Vehicle.search({body: q, type:"vehicle"}, function(err, data)
        {
            var states_agg = data.aggregations;

            var states = [];

            for (var i = 0, len = states_agg.states.buckets.length; i < len; i++)
            {
                var state = states_agg.states.buckets[i];

                var abbr = state.key;

                var state_name = UtilityService.abbr_state(abbr);

                if(state_name.length > 0)
                {
                    states.push({
                        state: abbr,
                        state_name: state_name.toTitleCase(),
                        count: state.doc_count
                    });
                }
            }

            var ret = {
                hits: states,
                total: states_agg.states.doc_count
            };

            callback(null, ret);
        });
    },
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