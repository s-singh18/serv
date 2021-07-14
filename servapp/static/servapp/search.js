mapboxgl.accessToken = document.querySelector('#mapbox-access-token').value;

document.addEventListener("DOMContentLoaded", function () {

    search();


});

function search() {
    let listings_geojson = (document.querySelector('#listings_geojson').value ? JSON.parse(document.querySelector('#listings_geojson').value) : '');
    let polygon_geojson = (document.querySelector('#polygon_geojson').value ? JSON.parse(document.querySelector('#polygon_geojson').value) : '');
    let center = (document.querySelector('#center').value ? JSON.parse(document.querySelector('#center').value) : '');
    let listing_type = document.querySelector('#listing_type').value;
    let location = document.querySelector('#location').value;
    mapboxgl.accessToken = document.querySelector('#mapbox-access-token').value;
    let bbox;
    if (polygon_geojson != "") {
        bbox = turf.bbox(polygon_geojson);
        // if (center == "") {
        //     center = turf.centroid(polygon_geojson)
        // }
    } else {
        // if incorrect search provide BBox for San Jose
        bbox = [-122.04567200033343, 37.12314499981398, -121.58587000038487, 37.469168000182016]
    }

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        // center: center,
        bbox: bbox,
        flyTo: false,

    });

    map.fitBounds(bbox, fitBoundsOptions = { duration: 0 });
    // If a layer with ID 'state-data' exists, remove it.
    // if (map.getLayer('polygon-boundary')) map.removeLayer('polygon-boundary');
    // // If a layer with ID 'state-data' exists, remove it.
    // if (map.getSource('polygon')) map.removeSource('polygon');

    let titles = document.getElementsByClassName("card-title");
    var counter = 0;
    if (listings_geojson.features.length > 0) {
        listings_geojson.features.forEach(listing => {
            // make a marker for each feature and add to the map
            let popup_div = document.createElement('div');
            let popup_title = document.createElement('a');
            let popup_para = document.createElement('p');

            // if (titles[counter].innerText == listing.properties.title) {
            let url = titles[counter].innerHTML;

            // popup_title.innerHTML = `<h4>${listing.properties.title}</h4>`;
            popup_title.innerHTML = `<h5>${url}</h5>`;
            popup_para.innerHTML = listing.properties.listing_type;

            popup_div.appendChild(popup_title);
            popup_div.appendChild(popup_para);

            let el = document.createElement('div');
            el.className = 'marker';

            new mapboxgl.Marker(el)
                .setLngLat(listing.geometry.coordinates)
                .setPopup(new mapboxgl.Popup({ offset: [0, -15] }) // add popups
                    .setDOMContent(popup_div))
                .addTo(map);

            counter = counter + 1;
        });
    }





    map.on('styledata', function () {


        map.addSource('polygon', {
            type: 'geojson',
            data: polygon_geojson,
        });

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
    });


}