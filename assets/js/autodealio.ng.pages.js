

autodealio.ng.app.services.searchFactory = function ($baseService, $http) {

    console.log("search service");
    var svc = this;

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

autodealio.ng.page.searchControllerFactory = function (
    $scope
    , $baseController
    , $searchService) {
console.log("search controller");
    var vm = this;
    vm.search = {};
    vm.vehicles = null;
    vm.meta = null;
    vm.$searchService = $searchService;
    vm.onVehicleSuccess = _onVehicleSuccess;
    vm.onVehicleError = _onVehicleError;

    //-- this line to simulate inheritance
    $.extend( vm, $baseController);

    //this is a wrapper for our small dependency on $scope
    vm.notify = vm.$searchService.getNotifier($scope);

    render();

    function render() {
        vm.$searchService.vehicles(vm.search, vm.onVehicleSuccess, vm.onVehicleError);
    }

    function _onVehicleSuccess(data) {
        console.log("vehicle data", data);
        vm.notify(function () {
            vm.vehicles = data.hits;
        });
    }

    function _onVehicleError(jqXhr, error) {
        console.error("error handled in search controller", error);
    }
};

/*
 Below here is where we register our service and controller with ng
 */

autodealio.ng.addService(autodealio.ng.app.module
    , "$searchService"
    , ["$baseService", "$http"]
    , autodealio.ng.app.services.searchFactory);

autodealio.ng.addController(autodealio.ng.app.module
    , "searchController"
    , ['$scope', '$baseController', "$searchService"]
    , autodealio.ng.page.searchControllerFactory);