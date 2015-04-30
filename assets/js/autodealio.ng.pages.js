autodealio.ng.app.services.searchFactory = function ($baseService, $http)
{
    var svc = this;

    $.extend( svc, $baseService);

    svc.vehicles = _vehicles;

    function _vehicles( query, success, error ) {

        var request = $http({
            method: "get",
            url: "/api/vehicles",
            params: null,
            data: query
        });

        return( request.then( success, error ) );
    }
};

autodealio.ng.page.gridControllerFactory = function (
    $scope
    , $baseController
    , $searchService)
{
//  page initialization
//  ---------------------------------------

//  initialize controller properties
    var vm = this;
    vm.query = {};
    vm.vehicles = null;
    vm.meta = {
        total_items:0
    };

    vm.paging = {
        page: 1,
        count:24
    };

//  inherit from app base controller
    $.extend( vm, $baseController);

//  save dependencies for later
    vm.$searchService = $searchService;
    vm.$scope = $scope;

//  expose public api
    vm.searchVehicles = _searchVehicles;
    vm.queryVehicles = _queryVehicles;
    vm.onVehicleSuccess = _onVehicleSuccess;
    vm.onVehicleError = _onVehicleError;

//  internal handler in case we need to fire angular refresh from outside event
    vm.notify = vm.$searchService.getNotifier($scope);

//  initialize the grid
    console.log(current_page);
    console.log(page_params);

    //switch (current_page)
    //{
    //    case
    //}
    _queryVehicles();

//  main controller members
//  ---------------------------------------
    function _searchVehicles(query) {
        vm.query = query;
        _queryVehicles();
    }

    function _queryVehicles() {
        vm.$searchService.vehicles(vm.query, vm.onVehicleSuccess, vm.onVehicleError);
    }

//  handlers
//  ---------------------------------------
    function _onVehicleSuccess(result) {
        vm.vehicles = result.data.hits;
    }

    function _onVehicleError(jqXhr, error) {
        console.error("error while getting vehicles", error);
    }
};

autodealio.ng.addService(autodealio.ng.app.module
    , "$searchService"
    , ["$baseService", "$http"]
    , autodealio.ng.app.services.searchFactory);

autodealio.ng.addController(autodealio.ng.app.module
    , "gridController"
    , ['$scope', '$baseController', "$searchService"]
    , autodealio.ng.page.gridControllerFactory);