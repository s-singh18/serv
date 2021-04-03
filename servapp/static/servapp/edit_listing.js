var marker = {};
var map = {};

mapboxgl.accessToken = document.querySelector('#mapbox-access-token').value;

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
    
    geocode_address();
    load_map();
    
    
    

});

function load_map() {
    var accessToken = document.querySelector('#mapbox-access-token').value;
    let listing_geojson = JSON.parse(document.querySelector('#listing-geojson').value);
    let address = document.querySelector('#address').value;
    let coordinates = [listing_geojson.features[0].geometry.coordinates[1], listing_geojson.features[0].geometry.coordinates[0]];
    console.log(coordinates);
    // [lat, lon]
    document.querySelector('#location').value = coordinates;
    map = L.map('leaflet-map').setView(coordinates, 18);
    var layer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: accessToken
    }).addTo(map);

    marker = L.marker(coordinates).addTo(map);
    marker.bindPopup(address).openPopup();
    let house_number = "";
    let road = "";
    let city = "";
    let state = "";
    let postcode = "";
    let country = "";

    map.on('click', (e) => {
        if (marker != undefined) {
            map.removeLayer(marker);
        };

        house_number = "";
        road = "";
        city = "";
        state = "";
        postcode = "";
        country = "";
    
        marker = L.marker(e.latlng).addTo(map);
        coordinates = [e.latlng.lat, e.latlng.lng];
        document.querySelector('#location').value = coordinates;
        
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}&addressdetails=1`)
        .then(response => response.json())
        .then(location_data => {
            console.log(location_data);
            if (location_data.address.house_number != undefined) {
                house_number = location_data.address.house_number + " ";
            }

            if (location_data.address.road != undefined) {
                road = location_data.address.road + ", ";
            }

            if (location_data.address.city != undefined) {
                city = location_data.address.city + ", ";
            }

            if (location_data.address.state != undefined) {
                state = location_data.address.state + " ";
            }

            if (location_data.address.postcode != undefined) {
                postcode = location_data.address.postcode + ", ";
            }

            if (location_data.address.country != undefined) {
                country = location_data.address.country;
            }

            let address = house_number + road + city + state + postcode + country;
            marker.bindPopup(address).openPopup();
            document.querySelector('#address').value = address;
            document.querySelector('#mapbox-address').value = address;
            document.getElementById('location').value = e.latlng.lat + "," + e.latlng.lng;
        });
    });
}
    

function geocode_address() {
    geocoder_address.addTo('#geocoder-address');
    document.querySelector('#address').type = "hidden";
    let geocoder_element = document.querySelector('.mapboxgl-ctrl-geocoder--input');
    geocoder_element.id = "mapbox-address";
    geocoder_element.className = "form-control";
    geocoder_element.value = document.querySelector('#address').value;
    
    // search_form.addEventListener("submit", (event) => {
    geocoder_address.on('result', (search_data) => {
        console.log(search_data);
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${search_data.result.place_name}`)
        .then(response => response.json())
        .then(data => {
            let lat;
            let lon;
            if (data[0].boundingbox != undefined) {
                let boundingbox = data[0].boundingbox;
                let bbox = [[parseFloat(boundingbox[0]), parseFloat(boundingbox[2])], [parseFloat(boundingbox[1]), parseFloat(boundingbox[3])]]
                lat = data[0].lat;
                lon = data[0].lon;

                map.fitBounds(bbox);
            } else {
                map.jumpTo({
                    center: data[0].center,
                    zoom: 12,
                    pitch: 45,
                    bearing: 90
                });
                lat = data[0].center[1];
                lon = data[0].center[0];
            }

            if (marker != undefined) {
                map.removeLayer(marker);
            };
        
            marker = L.marker([lat, lon]).addTo(map);
            marker.bindPopup(search_data.result.place_name).openPopup();
            document.querySelector('#address').value = search_data.result.place_name;
            document.querySelector('#mapbox-address').value = search_data.result.place_name;
            document.getElementById('location').value = lat + ',' + lon;
        });
    });
}