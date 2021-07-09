var marker = {};
var map = {};
const accessToken = document.querySelector('#mapbox-access-token').value;
mapboxgl.accessToken = accessToken;

var geocoder_address = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    marker: false,
    mapboxgl: mapboxgl,
    flyTo: false,
    countries: 'us',
    types: "address",
    placeholder: "Address",
});

document.addEventListener("DOMContentLoaded", function () {

    geocodeAddress();
    loadMap();

});

function loadMap() {
    map = L.map('leaflet-map').setView([37.3361905, -121.890583], 10);
    var layer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: accessToken
    }).addTo(map);

    map.on('click', (e) => {
        if (marker != undefined) {
            map.removeLayer(marker);
        };

        marker = L.marker(e.latlng).addTo(map);

        // fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}&addressdetails=1`)
        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${e.latlng.lng},${e.latlng.lat}.json?access_token=${accessToken}`)
            .then(response => response.json())
            .then(location_data => {
                if (location_data.features.length > 0) {
                    let address = house_number + road + city + state + postcode + country;
                    marker.bindPopup(address).openPopup();
                    document.querySelector('#listing-address').value = address;
                    document.querySelector('#mapbox-address').value = address;
                    document.getElementById('listing-location').value = e.latlng.lat + ',' + e.latlng.lng;
                } else {
                    document.querySelector('#listing-address').value = "";
                    document.querySelector('#mapbox-address').value = "";
                    document.getElementById('listing-location').value = "";
                }
            });
    });
}


function geocodeAddress() {
    geocoder_address.addTo('#geocoder-address');
    document.querySelector('#listing-address').type = "hidden";

    let geocoder_element = document.querySelector('.mapboxgl-ctrl-geocoder--input');
    geocoder_element.id = "mapbox-address";
    let geocoder_div = document.querySelector(".mapboxgl-ctrl-geocoder.mapboxgl-ctrl");
    geocoder_div.style.width = "100%";
    geocoder_div.style.maxWidth = "3600px";
    geocoder_div.style.marginRight = "0px";

    // search_form.addEventListener("submit", (event) => {
    geocoder_address.on('result', (search_data) => {
        console.log("Search Data:");
        console.log(search_data);
        // fetch(` https://nominatim.openstreetmap.org/search?format=json&q=${search_data.result.place_name}`)
        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${search_data.result.place_name}.json?limit=1&access_token=${accessToken}`)
            .then(response => response.json())
            .then(data => {
                let features = data.features[0];
                // let lat;
                // let lon;
                // if (data[0].boundingbox != undefined) {
                //     let boundingbox = data[0].boundingbox;
                //     let bbox = [[parseFloat(boundingbox[0]), parseFloat(boundingbox[2])], [parseFloat(boundingbox[1]), parseFloat(boundingbox[3])]]
                //     lat = data[0].lat;
                //     lon = data[0].lon;

                //     map.fitBounds(bbox);
                // } else {}
                map.setView(features.center, 18);
                // map.jumpTo({
                //     center: data[0].center,
                //     zoom: 12,
                //     pitch: 45,
                //     bearing: 90
                // });
                lat = data[0].center[1];
                lon = data[0].center[0];

                if (marker != undefined) {
                    map.removeLayer(marker);
                };

                marker = L.marker([lat, lon]).addTo(map);
                marker.bindPopup(search_data.result.place_name).openPopup();
                document.querySelector('#listing-address').value = search_data.result.place_name;
                document.querySelector('#mapbox-address').value = search_data.result.place_name;
                document.getElementById('listing-location').value = lat + ',' + lon;
            });
    });
}