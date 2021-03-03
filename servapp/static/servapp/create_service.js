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
        
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}&addressdetails=1`)
        .then(response => response.json())
        .then(location_data => {
            console.log(location_data);
            let house_number = "";
            let road = "";
            let city = "";
            let state = "";
            let postcode = "";
            let country = "";

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

            location_data.address.country
            let address = house_number + road + city + state + postcode + country;
            marker.bindPopup(address).openPopup();
            document.querySelector('#address').value = address;
            document.querySelector('#mapbox-address').value = address;
        });
    });
}
    

function geocode_address() {
    geocoder_address.addTo('#geocoder-address');
    document.querySelector('#address').type = "hidden";
    
    document.querySelector('.mapboxgl-ctrl-geocoder--input').id = "mapbox-address";
    document.querySelector('.mapboxgl-ctrl-geocoder--input').className = "form-control";
    
    // search_form.addEventListener("submit", (event) => {
    geocoder_address.on('result', (search_data) => {
        console.log(search_data);
        fetch(` https://nominatim.openstreetmap.org/search?format=json&q=${search_data.result.place_name}`)
        .then(response => response.json())
        .then(data => {
            let boundingbox = data[0].boundingbox;
            let bbox = [[parseFloat(boundingbox[0]), parseFloat(boundingbox[2])], [parseFloat(boundingbox[1]), parseFloat(boundingbox[3])]]
            let lat = data[0].lat;
            let lng = data[0].lon;

            map.fitBounds(bbox);

            if (marker != undefined) {
                map.removeLayer(marker);
            };
        
            marker = L.marker([lat, lng]).addTo(map);
            marker.bindPopup(search_data.result.place_name).openPopup();
            document.querySelector('#address').value = search_data.result.place_name;
            document.querySelector('#mapbox-address').value = search_data.result.place_name;
        });
    });
}