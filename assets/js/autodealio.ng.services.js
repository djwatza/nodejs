autodealio.ng.app.services.geoFactory = function ($baseService, $http)
{
    var svc = this;

    $.extend( svc, $baseService);

    //svc.baseUrl =

    svc.zipcodeSearch = _zipcodeSearch;
    svc.getStates = _getStates;
    svc.getCities = _getCities;

    function _getStates( success, error ) {

        var request = $http({
            method: "get",
            url: "/api/states",
            params: null
        });

        return( request.then( success, error ) );
    }

    function _getCities(state, success, error ) {

        var request = $http({
            method: "get",
            url: "/api/states/" + state + "/cities",
            params: null
        });

        return( request.then( success, error ) );
    }

    function _zipcodeSearch( query, success, error ) {

        var request = $http({
            method: "get",
            url: "/api/geo/search",
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

    svc.vehicles = _vehicles;

    function _vehicles( query, success, error ) {

        var request = $http({
            method: "get",
            url: "/api/vehicles",
            params: query
        });

        return( request.then( success, error ) );
    }
};

autodealio.ng.addService(autodealio.ng.app.module
    , "$searchService"
    , ["$baseService", "$http"]
    , autodealio.ng.app.services.searchFactory);