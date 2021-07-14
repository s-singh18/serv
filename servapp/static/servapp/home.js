var accessToken = document.querySelector('#mapbox-access-token').value;
mapboxgl.accessToken = accessToken;

const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    marker: false,
    mapboxgl: mapboxgl,
    flyTo: false,
    countries: 'us',
    types: "place, postcode",
    placeholder: "Location",
    render: function (item) {
        let place_name = item.place_name.replace(', United States', '');
        return `${place_name}
        `;
    }
});

document.addEventListener("DOMContentLoaded", function () {
    setGeocoder();

});

function setGeocoder() {
    // Replace existing form element with geocoder
    document.getElementById('location-input').remove();

    geocoder.addTo('#location-div');
    let geocoder_element = document.querySelector('.mapboxgl-ctrl-geocoder--input');
    geocoder_element.id = "location-input";
    geocoder_element.name = "location";
    geocoder_element.placeholder = "Location"
    geocoder_element.className = "form-control";
    geocoder_element.setAttribute("tabIndex", "0");
    geocoder_element.style.width = '100%';
    let geocoder_div = document.querySelector(".mapboxgl-ctrl-geocoder.mapboxgl-ctrl");
    // geocoder_div.classList.add('form-group');
    geocoder_div.style.minWidth = "0px";
    geocoder_div.style.width = "100%";
    // geocoder_div.style.maxWidth = "3600px";
    geocoder_div.style.margin = "0px";

    geocoder.on('result', (result) => {
        let item = result.result;
        console.log(item);
        let place_name = item.place_name.replace(", United States", "");
        geocoder.setInput(place_name);
        if (item.place_type[0] == "postcode") {
            document.getElementById("postcode").value = item.text;
            document.getElementById("place").value = item.context[0].text;
            document.getElementById("district").value = item.context[1].text;
            document.getElementById("region").value = STATES[item.context[2].text];
            document.getElementById("country").value = item.context[3].text;

        } else {
            document.getElementById("place").value = item.text;
            if (item.context.length > 2) {
                document.getElementById("district").value = item.context[0].text;
                document.getElementById("region").value = STATES[item.context[1].text];
                document.getElementById("country").value = item.context[2].text;
            } else {
                document.getElementById("region").value = STATES[item.context[0].text];
                document.getElementById("country").value = item.context[1].text;
            }
        }
        document.getElementById("home-submit").focus();

    });

}
