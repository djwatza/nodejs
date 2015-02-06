module.exports =
{
    list: function(params, callback)
    {

        console.log(params);
        var state = (UtilityService.empty(params.state)) ? null : params.state;
        var city = (UtilityService.empty(params.city)) ? null : params.city;
        var make = (UtilityService.empty(params.make)) ? null : params.make;
        var category = (UtilityService.empty(params.category)) ? null : params.category;
        var zip = (UtilityService.empty(params.zip)) ? null : params.zip;
        var page = (UtilityService.empty(params.page)) ? 1 : params.page;
        var count = (UtilityService.empty(params.count)) ? 10 : params.count;
        var random = (UtilityService.empty(params.random) || "true" != params.random) ? false : true;

        if(random) 
        {
            var q =
            {
                "query":
                {
                    "function_score" :
                    {
                        "query" :
                        {
                            "match_all": {}
                        },
                        "random_score" : {}
                    }
                }
            };
        }
        else
        {
            var q =
            {
                "query": {
                    "match_all": {}
                }
            };
        }

        q.filter =
        {
            "bool" : {
                "must" : []
            }
        };

        if(!UtilityService.empty(state))
        {
            q.filter.bool.must.push
            ({
                "term": {
                    "state": state
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

        console.log("base query\n%s", JSON.stringify(q));

        Vehicle.search({body: q, page: page, count: count}, callback);
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
