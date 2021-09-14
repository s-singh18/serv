document.addEventListener("DOMContentLoaded", function () {

    listing_page();
    // edit_review();


});


function listing_page(properties, owner) {
    let mapbox_access_token = document.querySelector('#mapbox-access-token').value;
    let listing_geojson = JSON.parse(document.querySelector('#listing-geojson').value);
    let coordinates = listing_geojson.features[0].geometry.coordinates;
    let icon_url = document.querySelector('#map-icon').value;
    // console.log(coordinates)
    // var mapboxClient = mapboxSdk({ accessToken: mapbox_access_token });
    // var request = mapboxClient.static
    //   .getStaticImage({
    //     ownerId: 'mapbox',
    //     styleId: 'streets-v11',
    //     width: 500,
    //     height: 350,
    //     position: {
    //       coordinates: [lon, lat],
    //       zoom: 12
    //     },

    // //     addlayer: addLayerStyle,
    // //   before_layer: 'road-label',
    //   });
    // var staticImageUrl = request.url();
    // document.querySelector('.location-map').src = staticImageUrl;
    let static_map = document.querySelector('#static-map')
    static_map.src = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s-s+430281(${coordinates[0]},${coordinates[1]})/${coordinates[0]},${coordinates[1]},15,0.00,0.00/500x300?access_token=${mapbox_access_token}`;

    // document.querySelector('.static-map').innerHTML = `<img src='https://api.mapbox.com/styles/v1/mapbox/light-v10/static/url-https%3A%2F%2Fdocs.mapbox.com%2Fapi%2Fimg%2Fcustom-marker.png(${lon},${lat})/${lon},${lat},15/500x300?access_token=${mapbox_access_token}>';`

}

// function edit_review() {
//     let review_link = document.querySelector('#edit-review');
//     review_link.on('click', () => {
//         // Get review elements from page
//         let review = document.querySelector('#review');
//         let review_stars = document.querySelector('#review-stars');
//         let review_text = document.querySelector('#review-text');
//         review_stars.style.display = none;
//         review_text.style.display = none;

//         // Create review form
//         let review_form = document.createElement('form');
//         review_form.className = "form-inline";
//         review_form.method = "POST";

//         // Stars
//         let stars = document.createElement('select');
//         stars.name = "stars";
//         stars.id = "stars"
//         for (let i = 1; i<=3; i++){
//             let opt = document.createElement('option');
//             opt.value = i;
//             opt.innerHTML = i;
//             stars.appendChild(opt);
//         }

//         // Review text
//         let text = document.createElement('textarea');
//         text.name = "text";
//         text.id = "review-text";
//         text.className = "form-control";
//         text.value = review_text.value;

//         let search_button = document.createElement("input");
//         search_button.className = "btn btn-primary"
//         search_button.type = "submit";
//         search_button.value = "Search";

//         review_form.addEventListener("submit", (event) => {
//             fetch("/edit_review", {
//             method: "POST",
//             body: JSON.stringify({
//                 username: document.querySelector('#listing-title').value,
//                 listing_title: listing_title,
//                 stars: stars,
//                 text: text,
//                 }),
//             });
//         });
//     });
// }