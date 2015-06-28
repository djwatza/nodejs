String.prototype.fromSlug = function()
{
    return this
        .replace('-',' ')
        .replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

autodealio = {
    ng : {
        page:{},
        app: {
            services: {}
            , controllers: {}
        }
        , exceptions: {}
        , examples: {}
        , defaultDependencies: ['infinite-scroll', 'ui.bootstrap', 'ngCookies']
        , getModuleDependencies: function(){
            if (autodealio.extraNgDependencies) {
                var newItems = autodealio.ng.defaultDependencies.concat(autodealio.extraNgDependencies);
                return newItems;
            }
            return autodealio.ng.defaultDependencies;
        }
    }
};

autodealio.ng.app.module = angular.module('autodealioApp', autodealio.ng.getModuleDependencies())
    .filter('slug', function () {
        return function (input) {
            if (input) {
                return input.toLowerCase()
                    .replace(/[^\w ]+/g,'')
                    .replace(/ +/g,'-');
            }
        }
    })
    .filter('monthPrice', function () {
        return function (input) {
            if (input) {
                var p = Number(input);
                return Math.round(((p *.0199) + p) / 72)
            }
        }
    });

autodealio.ng.app.module.value('$autodealio', autodealio  );

autodealio.ng.exceptions.argumentException = function (msg) {
    this.message = msg;
    var err = new Error();

    console.error(msg + "\n" + err.stack);
};

autodealio.ng.app.services.baseService = function ($win, $loc, $util) {

    var getChangeNotifier = function ($scope) {

        var self = this;

        self.scope = $scope;

        return function (fx) {
            self.scope.$apply(fx);
        }
    };

    var baseService = {
        $window: $win
        , getNotifier: getChangeNotifier
        , $location: $loc
        , $utils: $util
    };

    return baseService;
};

autodealio.ng.app.controllers.baseController = function ($doc, $logger, $auto) {

    var baseController = {
        $document: $doc
        , $log: $logger
        , $autodealio: $auto
    };

    return baseController;
};

autodealio.ng.getControllerInstance = function (jQueryObj) {///used to grab an instance of a controller bound to an Element
    console.log(jQueryObj);
    return angular.element(jQueryObj[0]).controller();
};

autodealio.ng.addService = function (ngModule, serviceName, dependencies, factory) {
    /*
     autodealio.ng.app.module.service(
     '$baseService', 
     ['$window', '$location', '$utils', autodealio.ng.app.services.baseService]);
     */
    if (!ngModule ||
        !serviceName || !factory ||
        !angular.isFunction(factory)) {
        throw new autodealio.ng.exceptions.argumentException("Invalid Service Call");
    }

    if (dependencies && !angular.isArray(dependencies)) {
        throw new autodealio.ng.exceptions.argumentException("Invalid Service Call [dependencies]");
    }
    else if (!dependencies) {
        dependencies = [];
    }

    dependencies.push(factory);

    ngModule.service(serviceName, dependencies);

};

autodealio.ng.addController = function (ngModule, controllerName, dependencies, factory) {
    if (!ngModule ||
        !controllerName || !factory ||
        !angular.isFunction(factory)) {
        throw new autodealio.ng.exceptions.argumentException("Invalid Service defined");
    }

    if (dependencies && !angular.isArray(dependencies)) {
        throw new autodealio.ng.exceptions.argumentException("Invalid Service Call [dependencies]");
    }
    else if (!dependencies) {
        dependencies = [];
    }

    dependencies.push(factory);
    ngModule.controller(controllerName, dependencies);

};

autodealio.ng.addService(autodealio.ng.app.module
    , "$baseService"
    , ['$window', '$location']
    , autodealio.ng.app.services.baseService);

autodealio.ng.addService(autodealio.ng.app.module
    , "$baseController"
    , ['$document', '$log', '$autodealio']
    , autodealio.ng.app.controllers.baseController);


//#endregion

//#region - Examples on how to use the core functions

//***************************************************************************************
//------------------------ Examples -------------------------------------
autodealio.ng.examples.exampleServices = function ($baseService) {

    var aautodealioServiceObject = autodealio.services.users;
    var newService = $.extend(true, {}, aautodealioServiceObject, baseService);

    return newService;
};

autodealio.ng.examples.exampleController = function ($scope, $baseController, $exampleSvc) {

    var vm = this;
    vm.items = null;
    vm.receiveItems = _receiveItems;

    //-- this line to simulate inheritance
    $.extend(true, vm, $baseController);

    //this is a wrapper for our small dependency on $scope
    vm.notify = $exampleSvc.getNotifier($scope);

    function _receiveItems(data) {
        //this receives the data and calls the special
        //notify method that will trigger ng to refresh UI
        vm.notify(function () {
            vm.items = data.items;
        });
    }
};


autodealio.ng.addService(autodealio.ng.app.module
    , "$exampleSvc"
    , ['$baseService']
    , autodealio.ng.examples.exampleServices);

autodealio.ng.addController(autodealio.ng.app.module
    , 'controllerName'
    , ['$scope', '$baseController', '$exampleSvc']
    , autodealio.ng.examples.exampleController
);


//------------------------ Examples -------------------------------------
//***************************************************************************************


//#endregion
