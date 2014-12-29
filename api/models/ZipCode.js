/**
 * Vehicle.js
 *
 * @description :: vehicle model to wrap objects from elasticsearch
 * @docs        :: http://sailsjs.org/#!documentation/models{
    "_index": "vehicle",
    "_type": "vehicle",
    "_id": "110988703",
    "_score": 1,
    "_source": {
        "vehicle_id": "110988703",
        "program_id": "2",
        "dealer_id": "249808",
        "zip_code": "91343",
        "radius": "100",
        "phone_number": "",
        "vin": "3FADP4BJ8EM106703",
        "stock_number": "P28948A",
        "year": "2014",
        "make": "Ford",
        "model": "Fiesta",
        "series": "SE",
        "mileage": "15925",
        "price": "15995.00",
        "interior_color": "Charcoal Black w/Silver",
        "exterior_color": "BLACK",
        "num_doors": "4",
        "num_cylinders": "4",
        "transmission_type": "AUTO",
        "certified_preowned": "0",
        "comments": "",
        "features": [
        ],
        "image_urls": [
        ],
        "city": "North Hills",
        "state": "CA",
        "today": "20141130"
    }
}
 */
module.exports =
{
    attributes:
    {
        connection: 'devElasticsearch'
    }
};

