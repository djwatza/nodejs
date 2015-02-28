String.prototype.toSlug = function()
{
    return this.toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;
};

String.prototype.fromSlug = function()
{
    return this
        .replace('-',' ')
        .replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
    });
};

Number.prototype.format = function(n, x) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
    return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
};

Autodealio = {
    params:{},
    pages: {
        landing:{},
        grid:{},
        vehicle:{}
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
    thumbnail: function(url, height, width, op) {
        var base_url = Autodealio.params.thumbnails.base;

        return base_url + op + "/" + width + "x" + height + "/" + url;
    },
    make_url: function(params)
    {
        return "/{0}-{1}-{2}-{3}-{4}".format(params.year, params.make.toSlug(), params.model.toSlug(), params.series.toSlug(), params.vin);
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
    append: function(data, header)
    {
        var t = Autodealio.pages.grid.vehicle;


        $(".results-count", t._container).text(header);

        var children = [];

        jQuery.each( data.hits, function( key, value ) {

            var clone = t._template.clone().removeAttr("id").removeClass("hidden").addClass("vehicle-grid-item");

            var name = value.year + " " + value.make + " " + value.model;

            $(".result-img", clone).attr("alt", "Used car deals on a " + name);

            if(value.image_urls.length > 0 && value.image_urls[0].length > 0)
            {
                $(".result-img", clone).attr("src", Autodealio.thumbnail(value.image_urls[0], 330, 440, 'crop'))
            }

            var state_url = "/" + value.state.toUpperCase();
            var city_url = state_url + "/" + value.city.toSlug();

            $(".overlay h3 a", clone).text(name).attr("href", Autodealio.make_url(value));
            $(".overlay strong", clone).text("Price: $" + parseInt(value.price).format(0,3));
            $(".other-info span", clone).html("Mileage:<br/>{0}".format(parseInt(value.mileage).format(0,3)));
            $(".other-info small", clone).html("Location:<br/><a href=\"{0}\">{1}</a>, <a href=\"{2}\">{3}</a>".format(city_url, value.city, state_url, value.state));

            children.push(clone);

            t._target.append(clone);
        });

        t._target.isotope( 'appended', children );
    }
};

Autodealio.pages.landing.homepage =
{
    run: function()
    {
        var t = Autodealio.pages.landing.homepage;

        var request = $.ajax({
            url: "/api/states",
            type: "GET",
            data: {},
            dataType: "json"
        });

        request.done(t.on_get_states);
        request.fail(function( jqXHR, textStatus ) {
            Autodealio.error("get states request failed: " + textStatus );
        });
    },
    on_get_states:function(data)
    {
        var target = jQuery("#states-list");
        var template = jQuery("#state-template");
        var t = Autodealio.pages.landing.homepage;

        var count = 0;

        jQuery.each( data.hits, function( key, value )
        {
            var clone = template.clone().removeAttr("id").removeClass("hidden").addClass("state-item");

            $("a", clone)
                .attr("href", "/" + value.state.toUpperCase())
                .text(value.state_name);

            $("span", clone)
                .text(value.count + " vehicles");

            target.append(clone);
            count++;
        });

        var container = target.isotope({
            itemSelector: '.state-item',
            layoutMode: 'fitRows',
            cellsByRow: {
                columnWidth: 110,
                rowHeight: 110
            },
            masonry: {
                columnWidth: 110
            }
        });
    }
};

Autodealio.pages.landing.city =
{
    _state: null,
    _city: null,
    _page: null,
    run: function()
    {
        var container = $(Autodealio.params.container_id);
        var template = $(Autodealio.params.template_id);

        var t = Autodealio.pages.landing.city;

        t._state = Autodealio.params.state.toUpperCase();
        t._city = Autodealio.params.city.fromSlug();
        t._page = 1;

        Autodealio.pages.grid.vehicle.initialize(container, template);

        Autodealio.services.vehicles.list({state: t._state, city: t._city}, t.on_get_vehicles);

        $(window).scroll(t.on_scroll);
    },
    on_get_vehicles: function(data)
    {
        Autodealio.pages.grid.vehicle.append(data, data.total + " used cars located in " + Autodealio.params.city.fromSlug() + ", " + Autodealio.params.state);
    },
    on_scroll: function()
    {
        if ($(window).scrollTop() >= $(document).height() - $(window).height() - 100)
        {
            var t = Autodealio.pages.landing.city;
            t._page += 1;
            t.scroll_page(t._page);
        }
    },
    scroll_page: function(page)
    {
        var t = Autodealio.pages.landing.city;

        Autodealio.services.vehicles.list({state: t._state, city: t._city,page: page}, t.on_get_vehicles);
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
        Autodealio.pages.grid.vehicle.append(data, data.total + " used cars located in " + Autodealio.params.state);
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
            var clone = template.clone().removeAttr("id").removeClass("hidden").addClass("city-item");

            $("a", clone)
                .attr("href", "/" + t._state + "/" + value.city.toSlug())
                .text(value.city);

            $("span", clone)
                .text(value.count + " vehicles");

            target.append(clone);
            count++;
        });

        var container = target.isotope({
            itemSelector: '.city-item',
            layoutMode: 'fitRows',
            cellsByRow: {
                columnWidth: 110,
                rowHeight: 110
            },
            masonry: {
                columnWidth: 110
            }
        });

        $(".cities-count").text("Located used vehicles for sale in " + count + " cities ");
    },
    scroll_page: function(page)
    {
        var t = Autodealio.pages.landing.state;

        Autodealio.services.vehicles.list({state: t._state, page: page}, t.on_get_vehicles);
    }
};

Autodealio.pages.vehicle.view =
{
    run: function()
    {
        var _SlideshowTransitions = [
            //Fade in L
            {
                $Duration: 1200,
                x: 0.3,
                $During: {$Left: [0.3, 0.7]},
                $Easing: {$Left: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear},
                $Opacity: 2
            }
            //Fade out R
            , {
                $Duration: 1200,
                x: -0.3,
                $SlideOut: true,
                $Easing: {$Left: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear},
                $Opacity: 2
            }
            //Fade in R
            , {
                $Duration: 1200,
                x: -0.3,
                $During: {$Left: [0.3, 0.7]},
                $Easing: {$Left: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear},
                $Opacity: 2
            }
            //Fade out L
            , {
                $Duration: 1200,
                x: 0.3,
                $SlideOut: true,
                $Easing: {$Left: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear},
                $Opacity: 2
            }

            //Fade in T
            , {
                $Duration: 1200,
                y: 0.3,
                $During: {$Top: [0.3, 0.7]},
                $Easing: {$Top: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear},
                $Opacity: 2,
                $Outside: true
            }
            //Fade out B
            , {
                $Duration: 1200,
                y: -0.3,
                $SlideOut: true,
                $Easing: {$Top: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear},
                $Opacity: 2,
                $Outside: true
            }
            //Fade in B
            , {
                $Duration: 1200,
                y: -0.3,
                $During: {$Top: [0.3, 0.7]},
                $Easing: {$Top: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear},
                $Opacity: 2
            }
            //Fade out T
            , {
                $Duration: 1200,
                y: 0.3,
                $SlideOut: true,
                $Easing: {$Top: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear},
                $Opacity: 2
            }

            //Fade in LR
            , {
                $Duration: 1200,
                x: 0.3,
                $Cols: 2,
                $During: {$Left: [0.3, 0.7]},
                $ChessMode: {$Column: 3},
                $Easing: {$Left: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear},
                $Opacity: 2,
                $Outside: true
            }
            //Fade out LR
            , {
                $Duration: 1200,
                x: 0.3,
                $Cols: 2,
                $SlideOut: true,
                $ChessMode: {$Column: 3},
                $Easing: {$Left: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear},
                $Opacity: 2,
                $Outside: true
            }
            //Fade in TB
            , {
                $Duration: 1200,
                y: 0.3,
                $Rows: 2,
                $During: {$Top: [0.3, 0.7]},
                $ChessMode: {$Row: 12},
                $Easing: {$Top: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear},
                $Opacity: 2
            }
            //Fade out TB
            , {
                $Duration: 1200,
                y: 0.3,
                $Rows: 2,
                $SlideOut: true,
                $ChessMode: {$Row: 12},
                $Easing: {$Top: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear},
                $Opacity: 2
            }

            //Fade in LR Chess
            , {
                $Duration: 1200,
                y: 0.3,
                $Cols: 2,
                $During: {$Top: [0.3, 0.7]},
                $ChessMode: {$Column: 12},
                $Easing: {$Top: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear},
                $Opacity: 2,
                $Outside: true
            }
            //Fade out LR Chess
            , {
                $Duration: 1200,
                y: -0.3,
                $Cols: 2,
                $SlideOut: true,
                $ChessMode: {$Column: 12},
                $Easing: {$Top: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear},
                $Opacity: 2
            }
            //Fade in TB Chess
            , {
                $Duration: 1200,
                x: 0.3,
                $Rows: 2,
                $During: {$Left: [0.3, 0.7]},
                $ChessMode: {$Row: 3},
                $Easing: {$Left: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear},
                $Opacity: 2,
                $Outside: true
            }
            //Fade out TB Chess
            , {
                $Duration: 1200,
                x: -0.3,
                $Rows: 2,
                $SlideOut: true,
                $ChessMode: {$Row: 3},
                $Easing: {$Left: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear},
                $Opacity: 2
            }

            //Fade in Corners
            , {
                $Duration: 1200,
                x: 0.3,
                y: 0.3,
                $Cols: 2,
                $Rows: 2,
                $During: {$Left: [0.3, 0.7], $Top: [0.3, 0.7]},
                $ChessMode: {$Column: 3, $Row: 12},
                $Easing: {
                    $Left: $JssorEasing$.$EaseInCubic,
                    $Top: $JssorEasing$.$EaseInCubic,
                    $Opacity: $JssorEasing$.$EaseLinear
                },
                $Opacity: 2,
                $Outside: true
            }
            //Fade out Corners
            , {
                $Duration: 1200,
                x: 0.3,
                y: 0.3,
                $Cols: 2,
                $Rows: 2,
                $During: {$Left: [0.3, 0.7], $Top: [0.3, 0.7]},
                $SlideOut: true,
                $ChessMode: {$Column: 3, $Row: 12},
                $Easing: {
                    $Left: $JssorEasing$.$EaseInCubic,
                    $Top: $JssorEasing$.$EaseInCubic,
                    $Opacity: $JssorEasing$.$EaseLinear
                },
                $Opacity: 2,
                $Outside: true
            }

            //Fade Clip in H
            , {
                $Duration: 1200,
                $Delay: 20,
                $Clip: 3,
                $Assembly: 260,
                $Easing: {$Clip: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear},
                $Opacity: 2
            }
            //Fade Clip out H
            , {
                $Duration: 1200,
                $Delay: 20,
                $Clip: 3,
                $SlideOut: true,
                $Assembly: 260,
                $Easing: {$Clip: $JssorEasing$.$EaseOutCubic, $Opacity: $JssorEasing$.$EaseLinear},
                $Opacity: 2
            }
            //Fade Clip in V
            , {
                $Duration: 1200,
                $Delay: 20,
                $Clip: 12,
                $Assembly: 260,
                $Easing: {$Clip: $JssorEasing$.$EaseInCubic, $Opacity: $JssorEasing$.$EaseLinear},
                $Opacity: 2
            }
            //Fade Clip out V
            , {
                $Duration: 1200,
                $Delay: 20,
                $Clip: 12,
                $SlideOut: true,
                $Assembly: 260,
                $Easing: {$Clip: $JssorEasing$.$EaseOutCubic, $Opacity: $JssorEasing$.$EaseLinear},
                $Opacity: 2
            }
        ];

        var options = {
            $AutoPlay: true,                                    //[Optional] Whether to auto play, to enable slideshow, this option must be set to true, default value is false
            $AutoPlayInterval: 1500,                            //[Optional] Interval (in milliseconds) to go for next slide since the previous stopped if the slider is auto playing, default value is 3000
            $PauseOnHover: 1,                                //[Optional] Whether to pause when mouse over if a slider is auto playing, 0 no pause, 1 pause for desktop, 2 pause for touch device, 3 pause for desktop and touch device, 4 freeze for desktop, 8 freeze for touch device, 12 freeze for desktop and touch device, default value is 1

            $DragOrientation: 3,                                //[Optional] Orientation to drag slide, 0 no drag, 1 horizental, 2 vertical, 3 either, default value is 1 (Note that the $DragOrientation should be the same as $PlayOrientation when $DisplayPieces is greater than 1, or parking position is not 0)
            $ArrowKeyNavigation: true,   			            //[Optional] Allows keyboard (arrow key) navigation or not, default value is false
            $SlideDuration: 800,                                //Specifies default duration (swipe) for slide in milliseconds

            $SlideshowOptions: {                                //[Optional] Options to specify and enable slideshow or not
                $Class: $JssorSlideshowRunner$,                 //[Required] Class to create instance of slideshow
                $Transitions: _SlideshowTransitions,            //[Required] An array of slideshow transitions to play slideshow
                $TransitionsOrder: 1,                           //[Optional] The way to choose transition to play slide, 1 Sequence, 0 Random
                $ShowLink: true                                    //[Optional] Whether to bring slide link on top of the slider when slideshow is running, default value is false
            },

            $ArrowNavigatorOptions: {                       //[Optional] Options to specify and enable arrow navigator or not
                $Class: $JssorArrowNavigator$,              //[Requried] Class to create arrow navigator instance
                $ChanceToShow: 1                               //[Required] 0 Never, 1 Mouse Over, 2 Always
            },

            $ThumbnailNavigatorOptions: {                       //[Optional] Options to specify and enable thumbnail navigator or not
                $Class: $JssorThumbnailNavigator$,              //[Required] Class to create thumbnail navigator instance
                $ChanceToShow: 2,                               //[Required] 0 Never, 1 Mouse Over, 2 Always

                $ActionMode: 1,                                 //[Optional] 0 None, 1 act by click, 2 act by mouse hover, 3 both, default value is 1
                $SpacingX: 0,                                   //[Optional] Horizontal space between each thumbnail in pixel, default value is 0
                $DisplayPieces: 20,                             //[Optional] Number of pieces to display, default value is 1
                $ParkingPosition: 360,	                       //[Optional] The offset position to park thumbnail


                $ChanceToShow: 2,                               //[Required] 0 Never, 1 Mouse Over, 2 Always
                $ActionMode: 1,                                 //[Optional] 0 None, 1 act by click, 2 act by mouse hover, 3 both, default value is 1
                $Lanes: 2,                                      //[Optional] Specify lanes to arrange thumbnails, default value is 1
                $SpacingX: 5,                                   //[Optional] Horizontal space between each thumbnail in pixel, default value is 0
                $SpacingY: 7,                                   //[Optional] Vertical space between each thumbnail in pixel, default value is 0
                $DisplayPieces: 6,                             //[Optional] Number of pieces to display, default value is 1
                $ParkingPosition: 156,                          //[Optional] The offset position to park thumbnail
                $Orientation: 1                                //[Optional] Orientation to arrange thumbnails, 1 horizental, 2 vertical, default value is 1
            }
        };

        var jssor_slider1 = new $JssorSlider$("slider1_container", options);
        //responsive code begin
        //you can remove responsive code if you don't want the slider scales while window resizes
        function ScaleSlider() {
            var parentWidth = jssor_slider1.$Elmt.parentNode.clientWidth;
            if (parentWidth)
                jssor_slider1.$ScaleWidth(Math.max(Math.min(parentWidth, 800), 300));
            else
                window.setTimeout(ScaleSlider, 30);
        }

        ScaleSlider();

        if (!navigator.userAgent.match(/(iPhone|iPod|iPad|BlackBerry|IEMobile)/)) {
            $(window).bind('resize', ScaleSlider);
        }

    }
};