autodealio.ng.page.suggestControllerFactory = function (
    $scope
    , $baseController
    , $geoService)
{
//  page initialization
//  ---------------------------------------

    var vm = this;
//  inherit from app base controller
    $.extend( vm, $baseController);

//  initialize controller properties
    vm.input = null;

//  save dependencies for later
    vm.$geoService = $geoService;
    vm.$scope = $scope;

//  expose public api
    vm.suggest = _suggest;

//  internal handler in case we need to fire angular refresh from outside event
    vm.notify = vm.$geoService.getNotifier($scope);

//  main controller members
//  ---------------------------------------
    function _suggest(input) {
        vm.$geoService.zipcodeSearch(input, _onSuggestSuccess, _onSuggestError);
    }

//  handlers
//  ---------------------------------------
    function _onSuggestSuccess(result) {
        vm.typeahead = result.data.hits;
        console.log("got suggestions", vm.typeahead);

        return vm.typeahead;
    }

    function _onSuggestError(jqXhr, error) {
        console.error("error while getting typeahead", error);
    }
};

autodealio.ng.addController(autodealio.ng.app.module
    , "suggestController"
    , ['$scope', '$baseController', "$geoService"]
    , autodealio.ng.page.suggestControllerFactory);


autodealio.ng.page.geoControllerFactory = function (
    $scope
    , $baseController
    , $geoService)
{
//  page initialization
//  ---------------------------------------

    var vm = this;
//  inherit from app base controller
    $.extend( vm, $baseController);

//  initialize controller properties
    vm.query = null;
    vm.states = null;
    vm.statesCount = 0;
    vm.cities = null;
    vm.citiesCount = 0;
    vm.typeahead = null;

//  save dependencies for later
    vm.$geoService = $geoService;
    vm.$scope = $scope;

//  expose public api
    vm.getStates = _getStates;

//  internal handler in case we need to fire angular refresh from outside event
    vm.notify = vm.$geoService.getNotifier($scope);

    switch (current_page)
    {
        case "landing_state":
            _getCities(page_params.state);
            break;

        default :
            _getStates();
            break;
    }

    $scope.$emit('iso-option', {
        itemSelector: '.state-item',
        layoutMode: 'masonry',
        cellsByRow: {
            columnWidth: 110,
            rowHeight: 110
        },
        masonry: {
            columnWidth: 110
        }
    });

//  main controller members
//  ---------------------------------------
    function _getCities(state)
    {
        vm.$geoService.getCities(state, _onGetCitiesSuccess, _onGetCitiesError);
    }

    function _getStates()
    {
        vm.$geoService.getStates(_onGetStatesSuccess, _onGetStatesError);
    }

//  handlers
//  ---------------------------------------
    function _onGetCitiesSuccess(result)
    {
        vm.cities = result.data.hits;
        vm.citiesCount = vm.cities.length;

        console.log("got cities");

        return vm.states;
    }

    function _onGetCitiesError(jqXhr, error) {
        console.error("error while getting cities", error);
    }

    function _onGetStatesSuccess(result)
    {
        console.log("got states");

        vm.states = result.data.hits;

        return vm.states;
    }

    function _onGetStatesError(jqXhr, error) {
        console.error("error while getting states", error);
    }
};

autodealio.ng.addController(autodealio.ng.app.module
    , "geoController"
    , ['$scope', '$baseController', "$geoService"]
    , autodealio.ng.page.geoControllerFactory);


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
        count:12
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
            $.extend( q, {state: page_params.state, city: page_params.city.fromSlug()});
            break;

        case 'landing_make':
            $.extend( q, {state: page_params.state, city: page_params.city.fromSlug(), make: page_params.make.fromSlug()});
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
            vm.meta.total_items = result.data.total;
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