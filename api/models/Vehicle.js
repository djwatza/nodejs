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
    connection: 'devElasticsearch',
    vehicle_id: {
      type: 'integer',
      defaultsTo: null
    },
    program_id: {
      type: 'string',
      defaultsTo: null
    },
    dealer_id: {
      type: 'integer',
      defaultsTo: null
    },
    zip_code: {
      type: 'integer',
      defaultsTo: 90293
    },
    radius: {
      type: 'integer',
      defaultsTo: 100
    },
    phone_number: {
      type: 'string',
      defaultsTo: null
    },
    vin: {
      type: 'string',
      defaultsTo: null
    },
    stock_number: {
      type: 'string',
      defaultsTo: null
    },
    year: {
      type: 'integer',
      defaultsTo: 2015
    },
    make: {
      type: 'string',
      defaultsTo: null
    },
    model: {
      type: 'string',
      defaultsTo: null
    },
    series: {
      type: 'string',
      defaultsTo: null
    },
    mileage: {
      type: 'integer',
      defaultsTo: null
    },
    price: {
      type: 'integer',
      defaultsTo: null
    },
    interior_color: {
      type: 'string',
      defaultsTo: null
    },
    exterior_color: {
      type: 'string',
      defaultsTo: null
    },
    num_doors: {
      type: 'integer',
      defaultsTo: null
    },
    num_cylinders: {
      type: 'integer',
      defaultsTo: null
    },
    transmission_type: {
      type: 'string',
      defaultsTo: 'AUTO'
    },
    certified_preowned: {
      type: 'boolean',
      defaultsTo: false
    },
    comments: {
      type: 'string',
      defaultsTo: null
    },
    features: {
      type: 'array',
      defaultsTo: []
    },
    image_urls: {
      type: 'array',
      defaultsTo: []
    },
    city: {
      type: 'string',
      defaultsTo: null
    },
    state: {
      type: 'string',
      defaultsTo: null
    },
    today: {
      type: 'date',
      defaultsTo: null
    }
  }
};

