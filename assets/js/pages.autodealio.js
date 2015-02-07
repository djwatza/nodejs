Autodealio = {
    params:{},
    pages: {
        landing:{},
        grid:{}
    },
    services: {
        vehicles:{}
    },
    log:function(msg)
    {
        console.log(msg);
    },
    error: function(msg)
    {
        console.log("there was an error >> " + msg);
    },
    thumbnail: function(url, height, width, op)
    {
        var base_url = Autodealio.params.thumbnails.base;

        return base_url + op + "/" + width + "x" + height + "/" + url;
    }
};

Autodealio.services.vehicles.list = function(params, callback)
{
    var request = $.ajax({
        url: "/api/vehicles",
        type: "GET",
        data: params,
        dataType: "json"
    });
    request.done(callback);
    request.fail(function( jqXHR, textStatus ) {
        Autodealio.error("get vehicles request failed: " + textStatus );
    });
};

Autodealio.pages.grid.vehicle =
{
    _container:null,
    _template:null,
    _target:null,
    _page:null,
    _on_scroll:null,
    initialize: function(container, template, scroll_callback)
    {
        var t = Autodealio.pages.grid.vehicle;
        t._container = container;
        t._template = template;
        t._target = $("div.row", container);
        t._on_scroll = scroll_callback;
        t._target.isotope({
            itemSelector : '.vehicle-grid-item',
            layoutMode: 'masonry'
        });
        t._page = 1;

        $(window).scroll(function ()
        {
            if ($(window).scrollTop() >= $(document).height() - $(window).height() - 100) { // height - 100px
                t._page += 1;
                t._on_scroll(t._page);
            }
        });
    },
    append: function(data)
    {
        var t = Autodealio.pages.grid.vehicle;

        $(".results-count", t._container).text(data.total + " used cars located in " + Autodealio.params.state);

        var children = [];

        jQuery.each( data.hits, function( key, value ) {

            var clone = t._template.clone().removeAttr("id").removeClass("hidden").addClass("vehicle-grid-item");

            var name = value.year + " " + value.make + " " + value.model;

            $(".result-img", clone).attr("alt", "Used car deals on a " + name);

            if(value.image_urls.length > 0 && value.image_urls[0].length > 0)
            {
                $(".result-img", clone).attr("src", Autodealio.thumbnail(value.image_urls[0], 330, 440, 'crop'))
            }

            $(".overlay h3 a", clone).text(name);
            $(".overlay strong", clone).text("Price: $" + value.price);
            $(".other-info span", clone).text("Mileage: " + value.mileage);
            $(".other-info small", clone).html("Location: <a href=\"#\">" + value.city + ", " + value.state + "</a>");

            children.push(clone);

            t._target.append(clone);
        });

        t._target.isotope( 'appended', children );
    }
};

Autodealio.pages.landing.state =
{
    _state:null,
    run: function()
    {
        var container = $(Autodealio.params.container_id);
        var template = $(Autodealio.params.template_id);

        var t = Autodealio.pages.landing.state;
        t._state = Autodealio.params.state;

        Autodealio.pages.grid.vehicle.initialize(container, template, t.on_scroll);

        Autodealio.services.vehicles.list({state: t._state}, t.on_get_vehicles);
    },
    on_get_vehicles: function(data)
    {
        Autodealio.pages.grid.vehicle.append(data);
    },
    on_scroll: function(page)
    {
        var t = Autodealio.pages.landing.state;

        Autodealio.services.vehicles.list({state: t._state, page: page}, t.on_get_vehicles);
    }
};
