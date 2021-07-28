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

var listingDiv = document.getElementById("listing-div");
var listingInput = document.getElementById("listing-input");
var listingSuggestions = document.getElementById("listing-suggestions");

var locationDiv = document.getElementById("location-div");
var locationInput = document.getElementById("location-input");
var locationSuggestions = document.getElementById("location-suggestions");


document.addEventListener("DOMContentLoaded", function () {
    setListingSearch();
    setGeocoder();
    // setInput(listingDiv, listingInput, listingSuggestions);
    // setInput(locationDiv, locationInput, locationSuggestions)
});





function setListingSearch() {
    listingInput.addEventListener("keyup", (e) => {
        console.log(e);
        let results = [];
        // console.log(input)
        if (listingInput.value.length) {
            let count = 0;
            listingSuggestions.style.display = "block";
            results = Array.from(filter(SERVICES_LIST, item => item.toLowerCase().includes(listingInput.value.toLowerCase()), 5));
            console.log(results);
            renderResults(results, listingInput, listingSuggestions);
        } else {
            listingSuggestions.innerHTML = ``;
        }

        // Hide suggestions if escape key is pressed
        if (e.key == "Escape") {
            if (listingSuggestions.style.display == "none") {
                listingSuggestions.style.display = "block";
            } else {
                listingSuggestions.style.display = "none";
            }
        }
    });

    // Click on input form
    listingInput.addEventListener("click", () => {
        listingSuggestions.style.display = "block";
    });

    // Click outside of input form
    document.addEventListener('click', (event) => {
        let withinBoundaries = event.composedPath().includes(listingDiv);
        console.log(event.composedPath());
        if (!withinBoundaries) {
            // Click happened **OUTSIDE** element
            listingSuggestions.style.display = "none";
        }
    });
}

function renderResults(results, input, suggestions_container) {
    suggestions_container.innerHTML = ``;

    if (results.length == 0) {
        return suggestions_container.innerHTML = `<li class="dropdown-item" role="option"><a class="dropdown-link">No results found for query <b>"${input.value}"</b></a></li>`;
    }
    let content = results.map((item) => {
        return createListElement(item);
    });
    console.log(content);
    let count = 0;
    content.forEach((item) => {
        suggestions_container.appendChild(item);
        item.addEventListener('click', (e) => {
            // console.log(e)
            input.value = e.toElement.innerText;
            suggestions_container.style.display = "none";
            focusInput(suggestions_container);
        });
        item.addEventListener('keypress', (e) => {
            if (e.key == "Enter") {
                input.value = e.toElement.innerText;
                suggestions_container.style.display = "none";
                focusInput(suggestions_container);
            }
        });
    });
}

function setGeocoder() {
    locationInput.addEventListener("keyup", (e) => {
        let place = locationInput.value;
        if (place.length > 0) {
            let place_url = place.replace(" ", "%20");
            fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${place_url}.json?access_token=${accessToken}&country=us&language=en&types=place,postcode`)
                .then(response => response.json())
                .then((data) => {
                    let features = data.features;
                    locationSuggestions.innerHTML = ``;
                    locationSuggestions.style.display = "block";
                    if (features.length > 0) {
                        features.forEach((feature) => {
                            let place_name = feature.place_name.replace(", United States", "");
                            let li = createListElement(place_name);
                            li.addEventListener("click", (e) => {
                                locationInput.value = e.toElement.innerText;
                                locationSuggestions.style.display = "none";
                                focusInput(locationSuggestions);
                            });
                            li.addEventListener('keypress', (e) => {
                                if (e.key == "Enter") {
                                    locationInput.value = e.toElement.innerText;
                                    locationSuggestions.style.display = "none";
                                    focusInput(locationSuggestions);
                                }
                            });
                            locationSuggestions.appendChild(li);
                        });
                    } else {
                        locationSuggestions.innerHTML = `<li class="dropdown-item" role="option"><a class="dropdown-link">No results found for query <b>"${input.value}"</b></a></li>`;
                    }
                });
        } else {
            locationSuggestions.innerHTML = ``;
        }

        if (e.key == "Escape") {
            locationSuggestions.style.display = "none";
        }

    });

    // Click on input form
    locationInput.addEventListener("click", () => {
        locationSuggestions.style.display = "block";
    });


    document.addEventListener('click', (event) => {
        let withinBoundaries = event.composedPath().includes(locationDiv)

        if (!withinBoundaries) {
            // Click happened **OUTSIDE** element
            locationSuggestions.style.display = "none";
        }
    });
}

function* filter(array, condition, maxSize) {
    if (!maxSize || maxSize > array.length) {
        maxSize = array.length;
    }
    let count = 0;
    let i = 0;
    while (count < maxSize && i < array.length) {
        if (condition(array[i])) {
            yield array[i];
            count++;
        }
        i++;
    }
}



function createListElement(item) {
    let a = document.createElement("a");
    a.className = "dropdown-item";
    a.innerText = item;
    a.href = "javascript:";
    a.setAttribute("role", "option")
    return a;
}

function focusInput(suggestions_container) {
    if (suggestions_container == listingSuggestions) {
        locationInput.focus()
    } else if (suggestions_container == locationSuggestions) {
        document.getElementById("home-submit").focus();
    }
}
