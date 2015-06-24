autodealio.ng.page.simpleSearchControllerFactory = function (
    $scope
    , $baseController
    , $searchService
    , $geoService
    , $cookies)
{
//  page initialization
//  ---------------------------------------
    var vm = this;
//  inherit from app base controller
    $.extend( vm, $baseController);

//  initialize controller properties
    vm.input = {
        simple:{
            make:0,
            model:0,
            zip_code:null
        }
    };

    vm.makes = null;
    vm.models = null;
    vm.selectedMake = null;
    vm.selectedModels = null;

//  save dependencies for later
    vm.$searchService = $searchService;
    vm.$geoService = $geoService;
    vm.$scope = $scope;
    vm.$cookies = $cookies;

//  expose public api
    vm.initialize = _initialize;
    vm.query = _query;
    vm.setMake = _setMake;
    vm.getModelsDisabled = _getModelsDisabled;

//  internal handler in case we need to fire angular refresh from outside event
    vm.notify = vm.$searchService.getNotifier($scope);

    _initialize();

//  main controller members
//  ---------------------------------------
    function _initialize() {
        vm.$searchService.vehicles({}, _onGetVehicleSuccess, _onGetVehicleError);
    }

    function _query()
    {
        console.log("query cars", vm.input.simple);

        vm.$geoService.zipcodeSearch(vm.input.simple.zip_code, _onQuerySuccess, _onQueryError);
    }

    function _setMake()
    {
        vm.selectedMake = vm.input.simple.make;

        console.log("selected make", vm.selectedMake);

        if(vm.models[vm.selectedMake.value])
        {
            vm.selectedModels = vm.models[vm.selectedMake.value];

            vm.input.simple.model = vm.selectedModels[0];
        }
    }

    function _getModelsDisabled()
    {
        return "false";// (vm.selectedModels && vm.selectedModels.length > 0) ? "false" : "disabled";
    }

//  handlers
//  ---------------------------------------
    function _onQuerySuccess(result)
    {
        if(result.data.hits && result.data.hits.length > 0)
        {
            var zip = result.data.hits[0];

            vm.$cookies[page_params.cookie_name] = JSON.stringify(zip);

            var url =  page_params.site.base;

            if(vm.selectedMake)
            {
                url += zip.state + "/" + zip.city + "/" + vm.selectedMake.value;
            }
            else
            {
                url += zip.state + "/" + zip.city;
            }

            window.location.href=url;
        }
    }

    function _onQueryError(jqXhr, error) {
        console.error("error while getting zip code query", error);
    }

    function _onGetVehicleSuccess(result)
    {
        if(result.data.aggregations && result.data.aggregations.makes)
        {
            vm.models = vm.$searchService.parseModels(result.data.aggregations.makes);
            vm.makes = vm.$searchService.parseMakes(result.data.aggregations.makes);

            vm.input.simple.make = vm.makes[0];

            vm.selectedModels = null;
        }
    }

    function _onGetVehicleError(jqXhr, error) {
        console.error("error while getting simple search vehicle query", error);
    }
};

autodealio.ng.addController(autodealio.ng.app.module
    , "simpleSearchController"
    , ['$scope', '$baseController', "$searchService", "$geoService", "$cookies"]
    , autodealio.ng.page.simpleSearchControllerFactory);


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
    , $searchService
    , $cookies)
{
//  page initialization
//  ---------------------------------------

//  initialize controller properties
    var vm = this;
    vm.busy = false;
    vm.query = {};
    vm.vehicles = null;
    vm.zip_code = null;
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
    vm.$cookies = $cookies;

//  expose public api
    vm.searchVehicles = _searchVehicles;
    vm.queryVehicles = _queryVehicles;
    vm.nextPage = _nextPage;
    vm.onVehicleSuccess = _onVehicleSuccess;
    vm.onVehicleError = _onVehicleError;

//  internal handler in case we need to fire angular refresh from outside event
    vm.notify = vm.$searchService.getNotifier($scope);

//  initialize the grid
    console.log("current page", current_page);
    console.log("page params", page_params);

    var q = vm.paging;

    switch (current_page)
    {
        case 'landing_state':
            $.extend( q, {state: page_params.state});
            break;

        case 'landing_city':
            if(vm.$cookies[page_params.cookie_name])
            {
                vm.zip_code = JSON.parse(vm.$cookies[page_params.cookie_name]);

                console.log("found zip in cookie (landing_city)", vm.zip_code);

                $.extend( q, {zip: vm.zip_code.zip_code});
            }
            else
            {
                $.extend( q, {state: page_params.state, city: page_params.city.fromSlug()});
            }
            break;

        case 'landing_make':
            //  TODO: combine cookie logic so both cases can call service function instead of duplicating code here
            if(vm.$cookies[page_params.cookie_name])
            {
                vm.zip_code = JSON.parse(vm.$cookies[page_params.cookie_name]);

                console.log("found zip in cookie (landing_make)", vm.zip_code);

                $.extend( q, {zip: vm.zip_code.zip_code, make: page_params.make.fromSlug()});
            }
            else
            {
                $.extend( q, {state: page_params.state, city: page_params.city.fromSlug(), make: page_params.make.fromSlug()});
            }
            
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
    , ['$scope', '$baseController', "$searchService", "$cookies"]
    , autodealio.ng.page.gridControllerFactory);