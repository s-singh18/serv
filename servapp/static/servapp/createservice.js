document.addEventListener("DOMContentLoaded", function () {
    
    load_address();
    

});

function load_address() {
    let accessToken = document.querySelector('#mapbox-access-token').value;
    
    var geocoder_address = new MapboxGeocoder({
        accessToken: accessToken,
        marker: false,
        mapboxgl: mapboxgl,
        flyTo: false,
        countries: 'us',
        types: "address",
        placeholder: "Address",
    }); 

    geocoder_address.addTo('#geocoder-address')

    geocoder_address.on('result', (search_data) => {
        document.querySelector('#geocoder-result').value = search_data.result.place_name;

    });


}