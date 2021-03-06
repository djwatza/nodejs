/**
 * Module Dependencies
 */
var _ = require('lodash');
var elasticsearch = require('es');

/**
 * waterline-autodealio
 *
 * Most of the methods below are optional.
 *
 * If you don't need / can't get to every method, just implement
 * what you have time for.  The other methods will only fail if
 * you try to call them!
 *
 * For many adapters, this file is all you need.  For very complex adapters, you may need more flexiblity.
 * In any case, it's probably a good idea to start with one file and refactor only if necessary.
 * If you do go that route, it's conventional in Node to create a `./lib` directory for your private submodules
 * and load them at the top of the file with other dependencies.  e.g. var update = `require('./lib/update')`;
 */
module.exports = (function () {


  // You'll want to maintain a reference to each connection
  // that gets registered with this adapter.
  var connections = {};
  var configs = {};


  // You may also want to store additional, private data
  // per-connection (esp. if your data store uses persistent
  // connections).
  //
  // Keep in mind that models can be configured to use different databases
  // within the same app, at the same time.
  //
  // i.e. if you're writing a MariaDB adapter, you should be aware that one
  // model might be configured as `host="localhost"` and another might be using
  // `host="foo.com"` at the same time.  Same thing goes for user, database,
  // password, or any other config.
  //
  // You don't have to support this feature right off the bat in your
  // adapter, but it ought to get done eventually.
  //

  var adapter = {

    // Set to true if this adapter supports (or requires) things like data types, validations, keys, etc.
    // If true, the schema for models using this adapter will be automatically synced when the server starts.
    // Not terribly relevant if your data store is not SQL/schemaful.
    //
    // If setting syncable, you should consider the migrate option,
    // which allows you to set how the sync will be performed.
    // It can be overridden globally in an app (config/adapters.js)
    // and on a per-model basis.
    //
    // IMPORTANT:
    // `migrate` is not a production data migration solution!
    // In production, always use `migrate: safe`
    //
    // drop   => Drop schema and data, then recreate it
    // alter  => Drop/add columns as necessary.
    // safe   => Don't change anything (good for production DBs)
    //
    syncable: false,


    // Default configuration for connections
    defaults: {
        host: 'localhost',
        port: 9200,
        schema: false,
        ssl: false,
        es: {index : null, type : null}
    },

    /**
     *
     * This method runs when a model is initially registered
     * at server-start-time.  This is the only required method.
     *
     * @param  {[type]}   connection [description]
     * @param  {[type]}   collection [description]
     * @param  {Function} cb         [description]
     * @return {[type]}              [description]
     */
    registerConnection: function(connection, collections, cb) {

      if(!connection.identity) return cb(new Error('Connection is missing an identity.'));
      if(connections[connection.identity]) return cb(new Error('Connection is already registered.'));

      // Add in logic here to initialize connection
      // e.g. connections[connection.identity] = new Database(connection, collections);
      connections[connection.identity] = elasticsearch({
        _index : connection.es.index,
        _type : connection.es.type,
        host : connection.host
      });

      configs[connection.identity] = connection;

      //console.log("HERE IN REGISTER ADAPTER");
      //console.log(connection);

      cb(null, true);
    },


    /**
     * Fired when a model is unregistered, typically when the server
     * is killed. Useful for tearing-down remaining open connections,
     * etc.
     *
     * @param  {Function} cb [description]
     * @return {[type]}      [description]
     */
    // Teardown a Connection
    teardown: function (conn, cb) {

      if (typeof conn == 'function') {
        cb = conn;
        conn = null;
      }
      if (!conn) {
        connections = {};
        return cb();
      }
      if(!connections[conn]) return cb();
      delete connections[conn];
      cb();
    },


    // Return attributes
    describe: function (connection, collection, cb) {
			// Add in logic here to describe a collection (e.g. DESCRIBE TABLE logic)
      return cb();
    },

    /**
     *
     * REQUIRED method if integrating with a schemaful
     * (SQL-ish) database.
     *
     */
    define: function (connection, collection, definition, cb) {
			// Add in logic here to create a collection (e.g. CREATE TABLE logic)
      return cb();
    },

    /**
     *
     * REQUIRED method if integrating with a schemaful
     * (SQL-ish) database.
     *
     */
    drop: function (connection, collection, relations, cb) {
			// Add in logic here to delete a collection (e.g. DROP TABLE logic)
			return cb();
    },

    /**
     *
     * REQUIRED method if users expect to call Model.find(), Model.findOne(),
     * or related.
     *
     * You should implement this method to respond with an array of instances.
     * Waterline core will take care of supporting all the other different
     * find methods/usages.
     *
     */
    find: function (connection, collection, options, cb)
    {
      return cb();
    },

    create: function (connection, collection, values, cb) {
      return cb();
    },

    update: function (connection, collection, options, values, cb) {
      return cb();
    },

    destroy: function (connection, collection, options, values, cb) {
      return cb();
    },
    search:function(connection, collection, options, cb)
    {
      var page = (UtilityService.empty(options.page)) ? 1 : options.page;
      var size = (UtilityService.empty(options.count)) ? 10 : options.count;
      var from = (page - 1) * size;

      var args =
      {
        host : configs[connection].host,
        _index : configs[connection].es.index,
        _type : configs[connection].es.type,
        from : from,
        size : size
      };

      if(!UtilityService.empty(options.type))
      {
        args._type = options.type;
      }

      if(!UtilityService.empty(options.index))
      {
        args._index = options.index;
      }

      connections[connection].search
      (
          args,
          options.body,
          function(err, data)
          {
            if(err)
              return cb(err);

            var results = _.map(data.hits.hits, function(hit)
            {
              var row = hit._source;

              if(!UtilityService.empty(hit.sort))
              {
                row.sort = hit.sort;
              }

              return row;
            });

            var ret = {
              hits: results,
              total: parseInt(data.hits.total),
              items_per_page: parseInt(size),
              from:parseInt(from)
            };

            if(typeof data.aggregations != 'undefined')
            {
              ret.aggregations = data.aggregations;
            }

            cb(null, ret);
          }
      );
    },
    findOne:function(connection, collection, options, cb)
    {
      var args =
      {
        host : configs[connection].host,
        _index : configs[connection].es.index,
        _type : configs[connection].es.type,
        _id:options.where.id
      };

      if(typeof options.where.parent_id != 'undefined')
      {
        args.parent = options.where.parent_id;
      }

      if(typeof options.where.type != 'undefined')
      {
        args._type = options.where.type;
      }

      if(typeof options.where.index != 'undefined')
      {
        args._index = options.where.index;
      }

      connections[connection].get
      (
          args,
          function(err, data)
          {
            if(err)
              return cb(err)

            return cb(null, data._source);
          }
      );
    }



    /*

    // Custom methods defined here will be available on all models
    // which are hooked up to this adapter:
    //
    // e.g.:
    //
    foo: function (collectionName, options, cb) {
      return cb(null,"ok");
    },
    bar: function (collectionName, options, cb) {
      if (!options.jello) return cb("Failure!");
      else return cb();
      destroy: function (connection, collection, options, values, cb) {
       return cb();
     }

    // So if you have three models:
    // Tiger, Sparrow, and User
    // 2 of which (Tiger and Sparrow) implement this custom adapter,
    // then you'll be able to access:
    //
    // Tiger.foo(...)
    // Tiger.bar(...)
    // Sparrow.foo(...)
    // Sparrow.bar(...)


    // Example success usage:
    //
    // (notice how the first argument goes away:)
    Tiger.foo({}, function (err, result) {
      if (err) return console.error(err);
      else console.log(result);

      // outputs: ok
    });

    // Example error usage:
    //
    // (notice how the first argument goes away:)
    Sparrow.bar({test: 'yes'}, function (err, result){
      if (err) console.error(err);
      else console.log(result);

      // outputs: Failure!
    })




    */




  };


  // Expose adapter definition
  return adapter;

})();

