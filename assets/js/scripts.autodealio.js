Autodealio.router =
{
    initialize: function(current_page, page_params)
    {
        Autodealio.params = page_params;
        Autodealio.log("Autodealio initialize -> current page is " + current_page);
        Autodealio.log(Autodealio.params);

        switch (current_page)
        {
            case "homepage":
                Autodealio.pages.landing.homepage.run();
                break;

            case "landing_state":
                Autodealio.pages.landing.state.run();
                break;

            case "landing_city":
                Autodealio.pages.landing.city.run();
                break;

            case "view_vehicle":
                Autodealio.pages.vehicle.view.run();
                break;
        }

        var search_form = $("form#main-search");

        if(search_form.length > 0)
        {
            Autodealio.search.initialize(search_form);
        }
    }
};

Autodealio.search =
{
    _form:null,
    initialize: function(form)
    {
        var t = Autodealio.search;

        t._form = form;

        $('input[name="zip_code"]', t._form).autoComplete({
            minChars: 2,
            source: function(term, suggest)
            {
                term = term.toLowerCase();

                Autodealio.log("search term is " + term);

                var matches = [];

                try { xhr.abort(); } catch(e){}
                
                var request = $.ajax({
                    url: "/api/geo/search",
                    type: "GET",
                    data: {q:term},
                    dataType: "json"
                });

                request.done(function(data)
                {
                    for (i=0; i<data.hits.length; i++)
                    {
                        var row = data.hits[i];

                        matches.push(row.zip_code + ": " + row.city + ", " + row.state_name);
                    }

                    suggest(matches);
                });

                request.fail(function( jqXHR, textStatus ) {
                    Autodealio.error("get states request failed: " + textStatus );
                });
            }
        });
    }

};
