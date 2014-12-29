module.exports =
{
    get_vehicle_by_zip_and_id: function(zip, id, callback)
    {
        ElasticsearchService.client().get
        (
            {_index : 'vehicle',_type : 'vehicle',host : '54.148.1.144', _id:id, parent:zip},
            callback
        );
    },
    get_random: function(count, callback)
    {
        ElasticsearchService.client().search
        (
            {_index : 'vehicle',_type : 'vehicle',host : '54.148.1.144', from: 0, size:count},
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
