// mapboxgl.accessToken = document.querySelector('#mapbox-access-token').value;
// var map = new mapboxgl.Map({
//     container: 'map',
//     style: 'mapbox://styles/mapbox/dark-v10',
//     center: [-121.8092822859134, 37.33677365503814],
//     zoom: 7
// });

// var geocoder_nav = new MapboxGeocoder({
//     accessToken: mapboxgl.accessToken,
//     marker: false,
//     mapboxgl: mapboxgl,
//     flyTo: false,
//     countries: 'us',
//     types: "place",
//     placeholder: "City",
// }); 

// var geocoder_index = new MapboxGeocoder({
//     accessToken: mapboxgl.accessToken,
//     marker: false,
//     mapboxgl: mapboxgl,
//     flyTo: false,
//     countries: 'us',
//     types: "place",
//     placeholder: "City",
// }); 


// var listings;
// var poly;
// var search_count = 0;
// var currentPage = 1;

// // var first = true;

// function removeElements(elms) {
//     elms.forEach(el => el.remove());
// }

// document.addEventListener("DOMContentLoaded", function () {
    
//     load_home();
    

// });

// function load_home() {
    // Show index view
    // document.querySelector('.home-view').style.display = "block";

    // let search_form = document.createElement("form");
    // search_form.className = "form-inline";

    // let input_div = document.createElement("div");
    // input_div.className = "mapbox-ctrl-geocoder mapbox-ctrl"

    // let search_field = document.createElement("input");
    // search_field.className = "mapboxgl-ctrl-geocoder--input"
    // search_field.id = "search-field"
    // search_field.type = "text";
    // search_field.placeholder = "Listing Type";

    // let search_button = document.createElement("input");
    // search_button.className = "btn btn-primary"
    // search_button.type = "submit";
    // search_button.value = "Search";


    // input_div.appendChild(search_field)
    // document.querySelector('.search-form').appendChild(input_div);
    // // document.querySelector('.search-form').appendChild(search_form);
    // geocoder_index.addTo('.search-form');
    // search_count = 0;
    
    // // search_form.addEventListener("submit", (event) => {
    // geocoder_index.on('result', (search_data) => {
    //     let listing_type = document.querySelector('#search-field').value;
    //     let location = search_data.result.place_name;
    //     if (listing_type !== "") {
    //         fetch(`search/${listing_type}/${location}`)
    //         .then(response => response.json())
    //         // .then(result => console.log(result))

    //     }
    // })
// }


// function load_result() {
//        // Hide home view
//     document.querySelector('.home-view').style.display = "none";
//     document.querySelector('.page-view').style.display = "none";

//     // Show results, listings, map, and nav bar geocoder
//     document.querySelector('.results-view').style.display = "block";
//     document.querySelector('.map-view').style.display = "block";
//     document.querySelector('.listings-view').style.display = "block";    
//     document.querySelector('.geocoder-nav').style.display = "block";
//     document.querySelector('.navbar-brand').style.display = "block";
    

//     // let search_form = document.createElement("form");
//     // search_form.className = "form-inline";
    
//     let input_div = document.createElement("div");
//     input_div.className = "mapbox-ctrl-geocoder mapbox-ctrl"

//     let search_field = document.createElement("input");
//     search_field.className = "mapboxgl-ctrl-geocoder--input"
//     search_field.id = "search-field"
//     search_field.type = "text";
//     search_field.placeholder = "Listing";

//     let search_button = document.createElement("input");
//     search_button.className = "btn btn-primary"
//     search_button.type = "submit";
//     search_button.value = "Search";

//     // search_form.appendChild(search_field);
//     input_div.appendChild(search_field)
//     // search_form.appendChild(geocoder_nav.onAdd(map));
//     // search_form.appendChild(search_button);
    
//     document.querySelector('#geocoder-nav').appendChild(input_div);
//     document.querySelector('#geocoder-nav').appendChild(geocoder_nav.onAdd(map));
//     // card_body.appendChild(edit_form);
//     // search_form.addEventListener("submit", (event) => {
//     geocoder_nav.on('result', (search_data) => {
        
//         let st = document.querySelector('#search-field').value;
//         search(search_data, st);
//     });

// }

// function search(search_data, listing_type) {
//     // event.preventDefault();
//     // event.stopPropagation();
//     currentPage = 1;

//     console.log(search_data)
//     let bbox = search_data.result.bbox;
//     load_map()
    

//     // Remove previous listings
//     if (document.body.contains(document.querySelector("#card-border"))) {
//         removeElements(document.querySelectorAll("#card-border"));
//     }
    
//     // Remove previous markers
//     if (document.body.contains(document.querySelector(".marker"))) {
//         removeElements(document.querySelectorAll(".marker"));
//     }



//     // let listing_type = document.querySelector("#search-field").value;
//     let location = search_data.result.place_name;

//     // If either search box is empty no submit
//     if (listing_type !== "" && location !== "") {
        
//         // Clear listings view
//         if (document.querySelector('.listings-view').hasChildNodes()) {
//             document.querySelector('.listings-view').removeChild(document.querySelector('.listings-view').childNodes[0]);
//           }
//         // console.log(listings)
//         // fetch city boundaries in the form of a Polygon geometry object from Open Street Map
//         // fetch(`https://nominatim.openstreetmap.org/search.php?q=${location}&polygon_geojson=1&format=json`)
//         // .then(response => response.json())
//         // .then(location_data => {
//         //     // poly = turf.polygon(location_data[0].geojson.coordinates);
//         //     poly = location_data[0].geojson
//         //     console.log(poly);
        
//             // Get listings from database based on listing type and location
//             fetch(`search/${listing_type}/${location}`)
//             // fetch("/search", {
//             // method: "POST",
//             // body: JSON.stringify({
//             //     listing_type: listing_type,
//             //     polygon_coordinates: poly.coordinates,
//             //     }),
//             // })
//             .then(response => response.json())
//             .then(geojson_data => {       
//                 // ...use `response.json`, `response.text`, etc. here
//                 console.log(geojson_data)
//                 let listings = JSON.parse(geojson_data.listings);
//                 let polygon = geojson_data.polygon;

//                 // console.log(listings.features[1].geometry.coordinates);      
//                 // map fly to location
//                 map.flyTo({
//                     center: search_data.result.geometry.coordinates,
//                     zoom: 10,
//                     speed: 1,
//                     curve: 1,
//                     easing(t) {
//                         return t;
//                     }
//                 });

//                 // If a layer with ID 'state-data' exists, remove it.
//                 if (map.getLayer('polygon-boundary')) map.removeLayer('polygon-boundary');
//                 // If a layer with ID 'state-data' exists, remove it.
//                 if (map.getSource('polygon')) map.removeSource('polygon');
                

//                 map.addSource('polygon', {
//                     type: 'geojson',
//                     data: polygon
//                 })

//                 map.addLayer({
//                     'id': 'polygon-boundary',
//                     'type': 'fill',
//                     'source': 'polygon',
//                     'paint': {
//                         'fill-color': '#888888',
//                         'fill-opacity': 0.4
//                     },
//                     'filter': ['==', '$type', 'Polygon']
//                 });

//                 let flag = false;
//                 var pt;
//                 // add markers to map
//                 if (listings == undefined) {
//                     let result = document.createElement('h3');
//                     result.id = "card-border";
//                     result.innerHTML = `No results for ${listing_type} at ${location}`;
//                     document.querySelector(".listings-view").appendChild(result);
//                 } else {
//                     listings.features.forEach(listing => {
//                         // create a HTML element for each feature
//                         let el = document.createElement('div');
//                         el.className = 'marker';
//                         // let coordinates = [listing.geometry.coordinates[1], listing.geometry.coordinates[0]]
//                         // pt = turf.point(coordinates)
//                         console.log(listing)
//                         // Check if point is in the polygon
//                         // if (turf.booleanPointInPolygon(pt, poly)) {
//                         flag = true;
//                         fetch(`/api/users/${listing.properties.user}/`)
//                         .then(response => response.json())
//                         .then(user_data => { 
                            
//                             // make a marker for each feature and add to the map
//                             let popup_div = document.createElement('div');
//                             let popup_title = document.createElement('a');
//                             let popup_para = document.createElement('p');

//                             popup_title.innerHTML = `<h4>${listing.properties.title}</h4>`;
//                             popup_para.innerHTML = listing.properties.listing_type;

//                             popup_div.appendChild(popup_title);
//                             popup_div.appendChild(popup_para);
                            

//                             new mapboxgl.Marker(el)
//                             .setLngLat(listing.geometry.coordinates)
//                             .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
//                             .setDOMContent(popup_div))
//                             .addTo(map);

//                             popup_title.addEventListener("click", (marker) => {
//                                 listing_page(listing.properties, user_data.username);
//                             })

//                             let card_border = document.createElement("div");
//                             card_border.className = "card border-dark mb-3";
//                             card_border.id = "card-border";

//                             let card = document.createElement("div");
//                             card.className = "card";
                            
//                             let card_body = document.createElement("div");
//                             card_body.className = "card-body";
//                             card_body.id = "card_body";
                            
//                             let card_title = document.createElement("h5");
//                             card_title.className = "card-title";
//                             card_title.innerHTML = listing.properties.title;
//                             card_title.addEventListener("click", () => {
//                                 listing_page(listing.properties, user_data.username);
//                             });

//                             let card_subtitle = document.createElement("h6");
//                             card_subtitle.className = "card-subtitle";
//                             card_subtitle.innerHTML = user_data.username;

//                             let card_text = document.createElement("p");
//                             card_text.className = "card-text";
//                             card_text.innerHTML = listing.properties.description;

//                             card_body.appendChild(card_title);
//                             card_body.appendChild(card_subtitle);
//                             card_body.appendChild(card_text);
                            
//                             card.appendChild(card_body);

//                             card_border.appendChild(card);
                
//                             // Add to view
//                             document.querySelector(".listings-view").appendChild(card_border);
//                         });
//                     });
//                 }   
//             });     
//         // });
//     }
// }

// function load_map() {
//     document.querySelector('.home-view').style.display = "none";
//     document.querySelector('.page-view').style.display = "none";
    
    
//     document.querySelector('.results-view').style.display = "block";
//     document.querySelector('.listings-view').style.display = "block";
//     document.querySelector('.map-view').style.display = "block";
    
    
    
    
// }




// function listing_page(properties, owner) {
//     document.querySelector('.results-view').style.display = "none";
//     document.querySelector('.listings-view').style.display = "none"; 
//     document.querySelector('.map-view').style.display = "none";
       

//     document.querySelector('.page-view').style.display = "block";
//     let page_view = document.querySelector(".page-view");

//     console.log(properties);

//     // Display property elements
//     document.querySelector('.properties-title').innerHTML = properties.title;
//     document.querySelector('.properties-owner').innerHTML = `Owner: ${owner}`;
//     document.querySelector('.properties-listing-type').innerHTML = properties.listing_type;
//     document.querySelector('.properties-rate').innerHTML = `Rate: ${properties.rate}/hr`;  
//     document.querySelector('.properties-description').innerHTML = properties.description;
    
//     let username = document.querySelector('#username').value;
//     let create_review = document.querySelector('.create-review');
//     console.log(username)
//     console.log(owner)
//     if (username != undefined && username != "") {
//         create_review.style.display = 'block';
//         let listing_title = document.createElement('input');
//         listing_title.type = 'hidden';
//         listing_title.name = 'listing_title';
//         listing_title.id = 'listing-title';
//         listing_title.value = properties.title;
//         document.querySelector('#review-form').appendChild(listing_title)

//     } else {
//         create_review.style.display = 'none';

//     }

//     fetch(`/get_reviews/${properties.title}`)
//     .then(response => response.json())
//     .then(result => {
//         let reviews = document.querySelector('.reviews');
//         if (reviews.hasChildNodes()) {
//             reviews.removeChild(reviews.childNodes[0]);
//         }

//         if (result === undefined) {
            
//             let no_reviews = document.createElement('h3');
//             no_reviews.innerHTML = "No reviews for this listing"
//             reviews.appendChild(no_reviews)
//         } else {

//             result.forEach((element) => {
//                 let review_writer = document.createElement("h3");    
//                 review_writer.innerHTML = element.writer;
//                 let review_stars = document.createElement("h6"); 
//                 review_stars.innerHTML = `${element.stars} Stars`;
//                 let review_text = document.createElement("p");
//                 review_text.innerHTML = element.text;

                
//                 reviews.appendChild(review_writer);
//                 reviews.appendChild(review_stars);
//                 reviews.appendChild(review_text);
//                 reviews.appendChild(document.createElement("hr"));
                
//             })
//         }
//         });

//     // geocoder_nav.on('result', (search_data) => {
//     //     let st = document.querySelector('#search-field').value;
//     //     search(search_data, st);
//     // });
// }