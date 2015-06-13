    {
            "mappings": {
                "zip_code": {
                    "properties": {
                        "city": {
                            "type": "string"
                        },
                        "code": {
                            "type": "string"
                        },
                        "country": {
                            "type": "string",
                            "index" : "not_analyzed"
                        },
                        "latitude": {
                            "type": "float"
                        },
                        "longitude": {
                            "type": "float"
                        },
                        "pin" : {
                            "properties" : {
                                "location" : {
                                    "type" : "geo_point"
                                }
                            }
                        },
                        "region": {
                            "type": "string"
                        },
                        "state": {
                            "type": "string",
                            "index" : "not_analyzed"
                        },
                        "state_name": {
                            "type": "string",
                            "index" : "not_analyzed"
                        },
                        "zip_code": {
                            "type": "integer",
                            "index" : "not_analyzed"
                        }
                    }

                },
                "vehicle": {
                    "_parent" : {
                        "type" : "zip_code"
                    },
                    "properties": {
                        "certified_preowned": {
                            "type": "boolean"
                        },
                        "city": {
                            "type": "string",
                            "index": "not_analyzed"
                        },
                        "comments": {
                            "type": "string"
                        },
                        "dealer_id": {
                            "type": "integer",
                            "index" : "not_analyzed"
                        },
                        "exterior_color": {
                            "type": "string"
                        },
                        "features": {
                            "type": "string"
                        },
                        "image_urls": {
                            "type": "string"
                        },
                        "interior_color": {
                            "type": "string"
                        },
                        "make": {
                            "type": "string",
                            "index" : "not_analyzed"
                        },
                        "mileage": {
                            "type": "integer"
                        },
                        "model": {
                            "type": "string",
                            "index" : "not_analyzed"
                        },
                        "num_cylinders": {
                            "type": "integer"
                        },
                        "num_doors": {
                            "type": "integer"
                        },
                        "price": {
                            "type": "float"
                        },
                        "program_id": {
                            "type": "integer",
                            "index" : "not_analyzed"
                        },
                        "radius": {
                            "type": "string"
                        },
                        "series": {
                            "type": "string"
                        },
                        "state": {
                            "type": "string",
                            "index" : "not_analyzed"
                        },
                        "stock_number": {
                            "type": "string"
                        },
                        "today": {
                            "type": "date"
                        },
                        "transmission_type": {
                            "type": "string"
                        },
                        "vehicle_id": {
                            "type": "string",
                            "index" : "not_analyzed"
                        },
                        "vin": {
                            "type": "string",
                            "index" : "not_analyzed"
                        },
                        "year": {
                            "type": "integer",
                            "index" : "not_analyzed"
                        },
                        "zip_code": {
                            "type": "integer",
                            "index" : "not_analyzed"
                        },
                        "pin" : {
                            "properties" : {
                                "location" : {
                                    "type" : "geo_point"
                                }
                            }
                        }
                    }
                }
            }
    }