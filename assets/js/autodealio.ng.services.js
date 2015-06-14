autodealio.ng.app.services.geoFactory = function ($baseService, $http)
{
    var svc = this;

    $.extend( svc, $baseService);

    svc.baseUrl = page_params.api.base;

    svc.zipcodeSearch = _zipcodeSearch;
    svc.getStates = _getStates;
    svc.getCities = _getCities;

    function _getStates( success, error ) {

        var request = $http({
            method: "get",
            url: svc.baseUrl + "api/states",
            params: null
        });

        return( request.then( success, error ) );
    }

    function _getCities(state, success, error ) {

        var request = $http({
            method: "get",
            url: svc.baseUrl + "api/states/" + state + "/cities",
            params: null
        });

        return( request.then( success, error ) );
    }

    function _zipcodeSearch( query, success, error ) {

        var request = $http({
            method: "get",
            url: svc.baseUrl + "api/geo/search",
            params: {q:query}
        });

        return( request.then( success, error ) );
    }
};

autodealio.ng.addService(autodealio.ng.app.module
    , "$geoService"
    , ["$baseService", "$http"]
    , autodealio.ng.app.services.geoFactory);

autodealio.ng.app.services.searchFactory = function ($baseService, $http)
{
    var svc = this;

    $.extend( svc, $baseService);

    svc.baseUrl = page_params.api.base;

    svc.vehicles = _vehicles;
    svc.parseMakes = _parseMakes;
    svc.parseModels = _parseModels;

    function _vehicles( query, success, error ) {

        var request = $http({
            method: "get",
            url: svc.baseUrl + "api/vehicles",
            params: query
        });

        return( request.then( success, error ) );
    }

    function _parseMakes(agg)
    {
        var makes = [{
            value:0,
            label: "Makes"
        }];

        angular.forEach(agg, function(value, key) {

            this.push({
                value:value.name,
                label: value.name + " (" +value.count + ")"
            });
        }, makes);

        return makes;
    }

    function _parseModels(agg)
    {
        var models = [];

        angular.forEach(agg, function(make, key) {

            var makes = [];
            angular.forEach(make.models, function(model, key) {

                this.push({
                    value:model.name,
                    label: model.name + " (" + model.count + ")"
                });
            }, makes);

            this[make.name] = makes;

        }, models);

        return models;
    }
};

autodealio.ng.addService(autodealio.ng.app.module
    , "$searchService"
    , ["$baseService", "$http"]
    , autodealio.ng.app.services.searchFactory);