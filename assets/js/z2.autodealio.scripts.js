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
                Autodealio.pages.landing.homepage.run(Autodealio.params);
                break;

            case "landing_search":
                Autodealio.pages.landing.search.run({zip: Autodealio.params.zip, autocomplete: Autodealio.params.autocomplete});
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
            Autodealio.forms.search.initialize(search_form);
        }

        var lead_form = $("form#autodealio-lead-form");

        if(lead_form.length > 0)
        {
            Autodealio.forms.lead.initialize(lead_form);
        }
    }
};

Autodealio.forms.lead =
{
    _form:null,
    _action:null,
    _lead_error: "Please enter your contact info to show you are a serious buyer.",
    initialize: function(form)
    {
        var t = Autodealio.forms.lead;

        t._form = form;

        t._action = t._form.attr("action");

        t._form.validate({
            rules: {
                first_name: "required",
                last_name: "required",
                email: {
                    required: true,
                    email: true
                },
                address: "required",
                zip_code: "required",
                city: "required",
                state: "required",
                phone1: "required",
                phone2: "required",
                phone3: "required"
            },
            messages: {},
            errorPlacement: function(error, element) {

                $("#lead-form-error").show();
                if($("#lead-form-error").text().length < 1)
                {
                    $("#lead-form-error").text(Autodealio.forms.lead._lead_error);
                }
            }
        });

        t._form.submit(t.on_submit);
    },
    on_submit:function(e)
    {
        e.preventDefault();

        var t = Autodealio.forms.lead;

        if(t._form.valid())
        {
            $("#lead-form-error").hide();

            var data = t._form.serializeObject();

            data.phone = data.phone1 + "-" + data.phone2 + "-" + data.phone3;

            Autodealio.log(data);

            var request = $.ajax({
                contentType: 'application/json',
                url: Autodealio.base + t._action,
                type: "POST",
                data: JSON.stringify(data),
                dataType: "json"
            });

            request.done(t.on_post_succes);
            request.fail(t.on_post_error);
        }
    },
    on_post_succes:function(data)
    {
        Autodealio.log("post lead success");
    },
    on_post_error:function(jqXHR, textStatus)
    {
        Autodealio.error("post lead request failed: " + textStatus );
    }

};

Autodealio.forms.search =
{
    _form:null,
    _field:null,
    initialize: function(form)
    {
        var t = Autodealio.forms.search;

        t._form = form
        t._form.submit(t.on_submit);

        t._field = $('input[name="autocomplete"]', t._form);
        t._field.autoComplete({
            minChars: 3,
            onSelect: t.on_autocomplete_select,
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
                    suggest(null);
                });
            }
        });
    },
    on_submit:function(e)
    {
        var t = Autodealio.forms.search;

        var term = t._field.val();

        t.on_autocomplete_select(term);
    },
    on_autocomplete_select:function(term)
    {
        var t = Autodealio.forms.search;

        var tmp = term.split(":");

        $('input[name="zip"]', t._form).val(tmp[0]);
    }
};
