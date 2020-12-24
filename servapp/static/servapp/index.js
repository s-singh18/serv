mapboxgl.accessToken = document.querySelector('#mapbox-access-token').value;
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-121.8092822859134, 37.33677365503814],
    zoom: 7
});

var geocoder_nav = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    marker: false,
    mapboxgl: mapboxgl,
    flyTo: false,
    countries: 'us',
    types: "place",
}); 

var geocoder_home = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    marker: false,
    mapboxgl: mapboxgl,
    flyTo: false,
    countries: 'us',
    types: "place",
}); 

// const csrfToken = getCookie('CSRF-TOKEN');

// const headers = new Headers({
//         'Content-Type': 'x-www-form-urlencoded',
//         'X-CSRF-TOKEN': csrfToken
// });

var listings;
var poly;
var search_count = 0;
// var first = true;

function removeElements(elms) {
    elms.forEach(el => el.remove());
}

document.addEventListener("DOMContentLoaded", function () {
    
    load_home();
    

});

function load_home() {
    // Hide results, map, listings, and nav geocode search
    document.querySelector('.results-view').style.display = "none";
    document.querySelector('.listings-view').style.display = "none";
    document.querySelector('.map-view').style.display = "none";
    document.querySelector('.geocoder-nav').style.display = "none";

    // Show home view
    document.querySelector('.home-view').style.display = "block";

    let search_form = document.createElement("form");
    search_form.className = "form-inline";

    let search_field = document.createElement("input");
    search_field.className = "mapboxgl-ctrl-geocoder--input"
    search_field.id = "search-field"
    search_field.type = "text";
    search_field.placeholder = "Service";

    let search_button = document.createElement("input");
    search_button.className = "btn btn-primary"
    search_button.type = "submit";
    search_button.value = "Search";

    search_form.appendChild(search_field);
    // search_form.appendChild(geocoder_home.onAdd(map));

    document.querySelector('.search-form').appendChild(search_form);
    geocoder_home.addTo('.search-form');
    search_count = 0;
    // search_form.addEventListener("submit", (event) => {
    geocoder_home.on('result', (search_data) => {
        var service_type = document.querySelector('#search-field').value;
        if (service_type !== "") {
            // Renders search.html page
            load_search();
            search(search_data, service_type);
                
            
        }
        
    });
}


function load_search() {
       // Hide home view
    document.querySelector('.home-view').style.display = "none";

    // Show results, listings, map, and nav bar geocoder
    document.querySelector('.results-view').style.display = "block";
    document.querySelector('.map-view').style.display = "block";
    document.querySelector('.listings-view').style.display = "block";    
    document.querySelector('.geocoder-nav').style.display = "block";

    let search_form = document.createElement("form");
    search_form.className = "form-inline";

    let search_field = document.createElement("input");
    search_field.className = "mapboxgl-ctrl-geocoder--input"
    search_field.id = "search-field"
    search_field.type = "text";
    search_field.placeholder = "Service";

    let search_button = document.createElement("input");
    search_button.className = "btn btn-primary"
    search_button.type = "submit";
    search_button.value = "Search";

    search_form.appendChild(search_field);
    search_form.appendChild(geocoder_nav.onAdd(map));
    // search_form.appendChild(search_button);
    
    document.querySelector('#geocoder-nav').appendChild(search_form);
    // card_body.appendChild(edit_form);
    // search_form.addEventListener("submit", (event) => {
    geocoder_nav.on('result', (search_data) => {
        let st = document.querySelector('#search-field').value;
        search(search_data, st);
    });

}

function search(search_data, service_type) {
    // event.preventDefault();
    // event.stopPropagation();
 

    console.log(search_data)
    let bbox = search_data.result.bbox;
    load_map()
    

    // Remove previous listings
    if (document.body.contains(document.querySelector("#card-border"))) {
        removeElements(document.querySelectorAll("#card-border"));
    }
    
    // Remove previous markers
    if (document.body.contains(document.querySelector(".marker"))) {
        removeElements(document.querySelectorAll(".marker"));
    }



    // let service_type = document.querySelector("#search-field").value;
    let location = search_data.result.place_name;

    // If either search box is empty no submit
    if (service_type !== "" && location !== "") {
        
        // flag for first search
        
        // console.log(listings)
        // fetch city boundaries in the form of a Polygon geometry object from Open Street Map
        fetch(`https://nominatim.openstreetmap.org/search.php?q=${location}&polygon_geojson=1&format=json`)
        .then(response => response.json())
        .then(location_data => {
            // poly = turf.polygon(location_data[0].geojson.coordinates);
            poly = location_data[0].geojson
            console.log(poly);
        
            // Get listings from database based on service type and location
            fetch(`/search/${service_type}`)
            .then(response => response.json())
            .then(data => {       
                // ...use `response.json`, `response.text`, etc. here
            
                listings = JSON.parse(data.geojson);
                console.log(listings)
                // console.log(listings.features[1].geometry.coordinates);
        
                
                // map fly to location
                map.flyTo({
                    center: search_data.result.geometry.coordinates,
                    zoom: 10,
                    speed: 1,
                    curve: 1,
                    easing(t) {
                        return t;
                    }
                });

                // If a layer with ID 'state-data' exists, remove it.
                if (map.getLayer('polygon-boundary')) map.removeLayer('polygon-boundary');
                // If a layer with ID 'state-data' exists, remove it.
                if (map.getSource('polygon')) map.removeSource('polygon');
                

                map.addSource('polygon', {
                    type: 'geojson',
                    data: poly
                })

                map.addLayer({
                    'id': 'polygon-boundary',
                    'type': 'fill',
                    'source': 'polygon',
                    'paint': {
                        'fill-color': '#888888',
                        'fill-opacity': 0.4
                    },
                    'filter': ['==', '$type', 'Polygon']
                });

                let flag = false;
                var pt;
                // add markers to map
                
                listings.features.forEach(listing => {
                    // create a HTML element for each feature
                    let el = document.createElement('div');
                    el.className = 'marker';
                    let coordinates = [listing.geometry.coordinates[1], listing.geometry.coordinates[0]]
                    pt = turf.point(coordinates)
                    console.log(listing.geometry)
                    // Check if point is in the polygon
                    if (turf.booleanPointInPolygon(pt, poly)) {
                        flag = true;
                        // make a marker for each feature and add to the map
                        let popup_div = document.createElement('div');
                        let popup_title = document.createElement('a');
                        let popup_para = document.createElement('p');

                        popup_title.innerHTML = `<h4>${listing.properties.title}</h4>`;
                        popup_para.innerHTML = listing.properties.service_type;

                        popup_div.appendChild(popup_title);
                        popup_div.appendChild(popup_para);
                        

                        new mapboxgl.Marker(el)
                        .setLngLat(coordinates)
                        .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
                        .setDOMContent(popup_div))
                        .addTo(map);

                        popup_title.addEventListener("click", (marker) => {
                            service_page(listing.properties);
                        })

                        let card_border = document.createElement("div");
                        card_border.className = "card border-dark mb-3";
                        card_border.id = "card-border";

                        let card = document.createElement("div");
                        card.className = "card";
                        
                        let card_body = document.createElement("div");
                        card_body.className = "card-body";
                        card_body.id = "card_body";
                        
                        let card_title = document.createElement("h5");
                        card_title.className = "card-title";
                        card_title.innerHTML = listing.properties.title;
                        card_title.addEventListener("click", () => {
                            service_page(listing.properties);
                        });

                        let card_subtitle = document.createElement("h6");
                        card_subtitle.className = "card-subtitle";
                        card_subtitle.innerHTML = listing.properties.owner;

                        let card_text = document.createElement("p");
                        card_text.className = "card-text";
                        card_text.innerHTML = listing.properties.description;

                        card_body.appendChild(card_title);
                        card_body.appendChild(card_subtitle);
                        card_body.appendChild(card_text);
                        
                        card.appendChild(card_body);

                        card_border.appendChild(card);
            
                        // Add to view
                        document.querySelector(".listings-view").appendChild(card_border);
                    }
                });

                    if (flag == false) {
                        let result = document.createElement('h3');
                        result.id = "card-border";
                        result.innerHTML = `No results for ${service_type} at ${location}`;
                        document.querySelector(".listings-view").appendChild(result);
                    }
                });
                
            
            });

        // async function poly_request() {
        //     let response = await fetch(`https://nominatim.openstreetmap.org/search.php?q=${location}&polygon_geojson=1&format=json`);
            
        //     if (!response.ok) {
        //         throw new Error(`HTTP error! status: ${response.status}`);
        //     } else {
        //         let myBlob = await response.json();   
        //         console.log(myBlob);         
        //         poly = turf.polygon(myBlob[0].geojson.coordinates);
                
        //     }
        // }

        // poly_request();

        
    }
}

function load_map() {
    document.querySelector('.home-view').style.display = "none";
    document.querySelector('.page-view').style.display = "none";
    
    
    document.querySelector('.results-view').style.display = "block";
    document.querySelector('.listings-view').style.display = "block";
    document.querySelector('.map-view').style.display = "block";
    
    
    
    
}




function service_page(properties) {
    document.querySelector('.results-view').style.display = "none";
    document.querySelector('.listings-view').style.display = "none"; 
    document.querySelector('.map-view').style.display = "none";
       

    document.querySelector('.page-view').style.display = "block";
    let page_view = document.querySelector(".page-view");

    console.log(properties);

    // Display property elements
    document.querySelector('.properties-title').innerHTML = properties.title;
    document.querySelector('.properties-owner').innerHTML = `Owner: ${properties.owner}`;
    document.querySelector('.properties-service-type').innerHTML = properties.service_type;
    document.querySelector('.properties-rate').innerHTML = `Rate: ${properties.rate}/hr`;  
    document.querySelector('.properties-description').innerHTML = properties.description;

    geocoder_nav.on('result', (search_data) => {
        let st = document.querySelector('#search-field').value;
        search(search_data, st);
    });
}