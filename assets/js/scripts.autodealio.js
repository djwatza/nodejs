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
    }
};

//};

