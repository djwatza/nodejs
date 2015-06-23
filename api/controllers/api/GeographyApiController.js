/**
 * GeographyApiController
 *
 * @description :: REST API for querying cities and states
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports =
{
    search: function (req, res)
    {
        if(typeof req.query.q == "undefined")
            return res.serverError("q is undefined");

        GeographyService.search(req.query.q, function(err, data)
        {
            if (err)
                return res.serverError(err);

            if(req.query.zip.length >= 5)
            {
                res.cookie(sails.config.autodealio.cookie_name, { zip:req.query.zip });
            }

            res.jsonx(data);
        });
    },
    states: function (req, res)
    {
        GeographyService.get_states(function(err, data)
        {
            if (err)
                return res.serverError(err);

            res.jsonx(data);
        });
    },
    cities: function (req, res)
    {
        GeographyService.get_cities_by_state(req.params.state, function(err, data)
        {
            if (err)
                return res.serverError(err);

            res.jsonx(data);
        });
    }
};

