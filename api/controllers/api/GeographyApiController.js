/**
 * GeographyApiController
 *
 * @description :: REST API for querying cities and states
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports =
{
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
    },
    nearest: function (req, res)
    {

    }
};

