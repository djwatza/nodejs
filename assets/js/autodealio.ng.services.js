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