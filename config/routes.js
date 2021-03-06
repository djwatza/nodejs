/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  '/': 'SiteController.index',

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  *  If a request to a URL doesn't match any of the custom routes above, it  *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/
    'get /:year-:make-:model-:series-:vin': {
      controller: 'SiteController',
      action: 'view',
      skipAssets: true
    },
    'get /:year-:make-:model--:vin': {
        controller: 'SiteController',
        action: 'view',
        skipAssets: true
    },
    'get /api/geo/search': {
        controller: 'api/GeographyApiController',
        action: 'search',
        skipAssets: true
    },
    'get /api/vehicles': {
      controller: 'api/VehiclesApiController',
      action: 'list',
      skipAssets: true
    },
    'post /api/vehicles/lead': {
        controller: 'api/VehiclesApiController',
        action: 'post',
        skipAssets: true
    },
    'get /api/states': {
        controller: 'api/GeographyApiController',
        action: 'states',
        skipAssets: true
    },
    'get /api/states/:state/cities': {
        controller: 'api/GeographyApiController',
        action: 'cities',
        skipAssets: true
    },
    'get /search': {
        controller: 'LandingController',
        action: 'search',
        skipAssets: true
    },
    'get /:state/:city': {
        controller: 'LandingController',
        action: 'city',
        skipAssets: true
    },
    'get /:state/:city/:make': {
        controller: 'LandingController',
        action: 'make',
        skipAssets: true
    },
    'get /:state': {
        controller: 'LandingController',
        action: 'state',
        skipAssets: true
    }
};
