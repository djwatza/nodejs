autodealio.ng.page.gridControllerFactory = function (
    $scope
    , $baseController
    , $searchService)
{
//  page initialization
//  ---------------------------------------

//  initialize controller properties
    var vm = this;
    vm.busy = false;
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
    vm.nextPage = _nextPage;
    vm.onVehicleSuccess = _onVehicleSuccess;
    vm.onVehicleError = _onVehicleError;

//  internal handler in case we need to fire angular refresh from outside event
    vm.notify = vm.$searchService.getNotifier($scope);

//  initialize the grid
    console.log(current_page);
    console.log(page_params);

    var q = vm.paging;

    switch (current_page)
    {
        case 'landing_state':
            $.extend( q, {state: page_params.state});
            break;

        case 'landing_city':
            $.extend( q, {state: page_params.state, city: page_params.city});
            break;
    }

    vm.query = q;

    console.log("init query", q);

    _queryVehicles();

//  main controller members
//  ---------------------------------------
    function _searchVehicles(query) {
        vm.query = query;
        _queryVehicles();
    }

    function _queryVehicles() {
        vm.busy = true;
        vm.$searchService.vehicles(vm.query, vm.onVehicleSuccess, vm.onVehicleError);
    }

    function _nextPage()
    {
        vm.query.page += 1;
        _queryVehicles();
    }

//  handlers
//  ---------------------------------------
    function _onVehicleSuccess(result) {
        vm.busy = false;

        if(null == vm.vehicles)
        {
            vm.vehicles = [];
        }

        vm.vehicles = vm.vehicles.concat(result.data.hits);
    }

    function _onVehicleError(jqXhr, error) {
        vm.busy = false;
        console.error("error while getting vehicles", error);
    }
};

autodealio.ng.addController(autodealio.ng.app.module
    , "gridController"
    , ['$scope', '$baseController', "$searchService"]
    , autodealio.ng.page.gridControllerFactory);