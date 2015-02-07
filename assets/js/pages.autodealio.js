String.prototype.toSlug = function()
{
    return this.toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;
};

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
    initialize: function(container, template)
    {
        var t = Autodealio.pages.grid.vehicle;
        t._container = container;
        t._template = template;
        t._target = $("div.row", container);
        t._target.isotope({
            itemSelector : '.vehicle-grid-item',
            layoutMode: 'masonry'
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
    _page:null,
    run: function()
    {
        var container = $(Autodealio.params.container_id);
        var template = $(Autodealio.params.template_id);

        var t = Autodealio.pages.landing.state;

        t._state = Autodealio.params.state;
        t._page = 1;

        Autodealio.pages.grid.vehicle.initialize(container, template);

        Autodealio.services.vehicles.list({state: t._state}, t.on_get_vehicles);

        $(window).scroll(t.on_scroll);

        var request = $.ajax({
            url: "/api/states/" + t._state + "/cities",
            type: "GET",
            data: {},
            dataType: "json"
        });
        request.done(t.on_get_cities);
        request.fail(function( jqXHR, textStatus ) {
            Autodealio.error("get cities request failed: " + textStatus );
        });
    },
    on_get_vehicles: function(data)
    {
        Autodealio.pages.grid.vehicle.append(data);
    },
    on_scroll: function()
    {
        if ($(window).scrollTop() >= $(document).height() - $(window).height() - 100)
        {
            var t = Autodealio.pages.landing.state;
            t._page += 1;
            t.scroll_page(t._page);
        }
    },
    on_get_cities:function(data)
    {
        var target = jQuery("#cities-list");
        var template = jQuery("#city-template");
        var t = Autodealio.pages.landing.state;

        var count = 0;

        jQuery.each( data.hits, function( key, value )
        {
            var clone = template.clone().removeAttr("id").removeClass("hidden");

            $("a", clone)
                .attr("href", "/" + t._state + "/" + value.city.toSlug())
                .text(value.city + " (" + value.count + ")");

            target.append(clone);
            count++;
        });

        $(".cities-count").text("Located used vehicles for sale in " + count + " cities ");
    },
    scroll_page: function(page)
    {
        var t = Autodealio.pages.landing.state;

        Autodealio.services.vehicles.list({state: t._state, page: page}, t.on_get_vehicles);
    }
};
