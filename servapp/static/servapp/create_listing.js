var marker = {};
var map = {};

const CATEGORY_AMOUNT = 3;

var accessToken = document.querySelector('#mapbox-access-token').value;
mapboxgl.accessToken = accessToken;

var geocoder_address = new MapboxGeocoder({
    accessToken: accessToken,
    marker: false,
    mapboxgl: mapboxgl,
    flyTo: false,
    countries: 'us',
    types: "address",
    placeholder: "Address",
    render: function (item) {
        return `${item.place_name}`;
    }
});

var categoryDiv = document.getElementById("category-div")
var category = document.getElementById("category");
var categorySuggestions = document.getElementById("category-suggestions");
var categoryDropdown = document.getElementById("category-dropdown");
var categories = [];

var prevAddress = "";
var addressDiv = document.getElementById("address-div");
var addressInput = document.getElementById("listing-address");
var addressSuggestions = document.getElementById("address-suggestions");

document.addEventListener("DOMContentLoaded", function () {
    setCategories(category, categorySuggestions, categoryDiv, categoryDropdown);
    setAddresses(addressInput, addressSuggestions, addressDiv)
    loadMap();

});

function setCategories(input, suggestions, div, dropdown) {
    suggestions.style.display = "none";
    input.innerText = "";
    input.addEventListener("keyup", (e) => {
        console.log(e);
        let results = [];
        // console.log(input)
        if (input.value.length) {
            let count = 0;
            suggestions.style.display = "block";
            // item => item.toLowerCase().includes(listingInput.value.toLowerCase())
            let services_list_copy = SERVICES_LIST.slice();
            results = Array.from(filter(services_list_copy, item => item.substring(0, input.value.length).toLowerCase().includes(input.value.toLowerCase()), item => item.toLowerCase().includes(input.value.toLowerCase()), 5));
            console.log(results);
            renderResults(results, input, suggestions, div, dropdown);
        } else {
            listingSuggestions.innerHTML = ``;
        }

        // Hide suggestions if escape key is pressed
        if (e.key == "Escape") {
            if (suggestions.style.display == "none") {
                suggestions.style.display = "block";
            } else {
                suggestions.style.display = "none";
            }
        }
    });

    // Click on input form
    input.addEventListener("click", () => {
        suggestions.style.display = "block";
    });

    // Click outside of input form
    document.addEventListener('click', (event) => {
        let withinBoundaries = event.composedPath().includes(div);
        if (!withinBoundaries) {
            console.log(event.composedPath());
            // Click happened **OUTSIDE** element
            suggestions.style.display = "none";
        }
    });
}

function renderResults(results, input, suggestions, div, dropdown) {
    suggestions.innerHTML = ``;

    if (results.length == 0) {
        return suggestions.innerHTML = `<li class="dropdown-item" role="option"><a class="dropdown-link">No results found for query <b>"${input.value}"</b></a></li>`;
    }
    let content = results.map((item) => {
        return createListElement(item);
    });
    console.log(content);
    let count = 0;
    content.forEach((item) => {
        suggestions.appendChild(item);
        item.addEventListener('click', (e) => {
            addElement(e, input, suggestions, div, "category", categories, dropdown)
        });
        item.addEventListener('keypress', (e) => {
            if (e.key == "Enter") {
                addElement(e, input, suggestions, div, "category", categories, dropdown)
            }
        });
    });
}

function setAddresses(input, suggestions, div) {
    suggestions.style.display = "none";
    input.addEventListener("keyup", (e) => {
        let place = input.value;
        if (place.length > 0 && place != prevAddress) {
            prevAddress = place
            let place_url = place.replace(" ", "%20");
            fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${place_url}.json?access_token=${accessToken}&country=us&language=en&types=address`)
                .then(response => response.json())
                .then((data) => {
                    let features = data.features;
                    suggestions.innerHTML = ``;
                    suggestions.style.display = "block";
                    if (features.length > 0) {
                        features.forEach((feature) => {
                            let place_name = feature.place_name.replace(", United States", "");
                            let li = createListElement(place_name);
                            suggestions.appendChild(li);
                            li.addEventListener("click", (e) => {
                                input.value = e.toElement.innerText;
                                suggestions.style.display = "none";
                                fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${input.value}.json?limit=1&access_token=${accessToken}`)
                                    .then(response => response.json())
                                    .then(data => {
                                        let features = data.features[0];
                                        map.setView(features.center, 18);
                                        lat = features.center[1];
                                        lon = features.center[0];
                                        if (marker != undefined) {
                                            map.removeLayer(marker);
                                        };
                                        marker = L.marker([lat, lon]).addTo(map);
                                        marker.bindPopup(input.value).openPopup();
                                        // document.querySelector('#listing-address').value = input.value;
                                        document.getElementById('listing-location').value = lat + ',' + lon;
                                    });
                            });
                        });
                    } else {
                        suggestions.innerHTML = `<li class="dropdown-item" role="option"><a class="dropdown-link">No results found for query <b>"${input.value}"</b></a></li>`;
                    }
                });
        } else {
            suggestions.innerHTML = ``;
        }
        if (e.key == "Escape") {
            suggestions.style.display = "none";
        }
    });
    // Click on input form
    input.addEventListener("click", () => {
        suggestions.style.display = "block";
    });
    document.addEventListener('click', (event) => {
        let withinBoundaries = event.composedPath().includes(div)

        if (!withinBoundaries) {
            // Click happened **OUTSIDE** element
            suggestions.style.display = "none";
        }
    });
}

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
                    let address = location_data.features[0].place_name;
                    marker.bindPopup(address).openPopup();
                    document.querySelector('#listing-address').value = address;
                    // document.querySelector('#mapbox-address').value = address;
                    document.getElementById('listing-location').value = e.latlng.lat + ',' + e.latlng.lng;
                } else {
                    document.querySelector('#listing-address').value = "";
                    // document.querySelector('#mapbox-address').value = "";
                    document.getElementById('listing-location').value = "";
                }
            });
    });
}
