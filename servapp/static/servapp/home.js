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
    setGeocoder();
    setListingSearch();

});


function setGeocoder() {
    let suggestions = ``;
    locationInput.addEventListener("keyup", (e) => {
        let place = locationInput.value;
        if (place.length > 0) {
            let place_url = place.replace(" ", "%20");
            fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${place_url}.json?access_token=${accessToken}&country=us&language=en&types=place,postcode`)
                .then(response => response.json())
                .then((data) => {
                    let features = data.features;
                    if (features.length > 0) {
                        locationSuggestions.innerHTML = ``;
                        features.forEach((feature) => {
                            let place_name = feature.place_name.replace(", United States", "");
                            let li = createListElement(place_name);
                            li.addEventListener("click", (e) => {
                                locationInput.value = e.toElement.innerText;
                                locationSuggestions.classList.remove("show");
                                locationInput.setAttribute("aria-expanded", "false");
                                suggestions = locationSuggestions.innerHTML;
                                locationSuggestions.innerHTML = ``;
                            });
                            locationSuggestions.appendChild(li);
                        });
                    }
                });
        }


        if (e.key == "Escape") {
            locationSuggestions.classList.remove("show");
            locationInput.setAttribute("aria-expanded", "false");
        }

    });

    let listing_div = document.getElementById('listing-div');

    document.addEventListener('click', (event) => {
        let withinBoundaries = event.composedPath().includes(listing_div)

        if (withinBoundaries) {
            // Click happened inside element
            locationSuggestions.classList.add("show");
            locationInput.setAttribute("aria-expanded", "true");
        } else {
            // Click happened **OUTSIDE** element
            locationSuggestions.classList.remove("show");
            locationInput.setAttribute("aria-expanded", "false");
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

function setListingSearch() {
    listingDiv.classList.remove("show");
    listingInput.addEventListener("keyup", (e) => {
        console.log(e);
        let results = [];
        let input = listingInput.value;
        // console.log(input)
        if (input.length) {
            let count = 0;
            results = Array.from(filter(SERVICES_LIST, item => item.toLowerCase().includes(input.toLowerCase()), 5));
            listingDiv.classList.add("show");
            console.log(results);
            renderResults(results, input);
        } else {
            listingDiv.classList.remove("show");
            listingInput.setAttribute("aria-expanded", "false");
        }
        if (e.key == "Escape") {
            listingDiv.classList.remove("show");
            listingInput.setAttribute("aria-expanded", "false");
        }
    });

    listingInput.addEventListener("click", () => {
        if (listingInput.value.length == 0) {
            console.log("No show");
            listingDiv.classList.remove("show");
            listingInput.setAttribute("aria-expanded", "false");
        }
    });
}



const array = [1, 2, 3, 4, 5, 6, 7, 8, 9];

console.log(Array.from(filter(array, i => i % 2 === 0, 2))); // expect 2 & 4


function renderResults(results, input) {
    listingSuggestions.innerHTML = ``;
    if (input.length == 0) {
        listingDiv.classList.remove("show");
        listingInput.setAttribute("aria-expanded") = "false";
    }
    if (results.length == 0) {
        return listingSuggestions.innerHTML = `<li class="dropdown-item"><a class="dropdown-link">No results found for query <b>"${input}"</b></a></li>`;
    }
    let content = results.map((item) => {
        return createListElement(item);
    });
    console.log(content);
    let count = 0;
    content.forEach((item) => {
        item.addEventListener('click', (e) => {
            console.log(e)
            listingInput.value = e.toElement.innerText;
            listingDiv.classList.remove("show");
        });
        listingSuggestions.appendChild(item);
    });

}

function createListElement(item) {
    let a = document.createElement("a");
    a.className = "dropdown-item";
    a.innerText = item;
    return a;
}


// function setGeocoder() {
//     // Replace existing form element with geocoder
//     document.getElementById('location-input').remove();

//     geocoder.addTo('#location-div');
//     let geocoder_element = document.querySelector('.mapboxgl-ctrl-geocoder--input');
//     geocoder_element.id = "location-input";
//     geocoder_element.name = "location";
//     geocoder_element.placeholder = "Location"
//     geocoder_element.className = "form-control";
//     geocoder_element.setAttribute("tabIndex", "0");
//     geocoder_element.style.width = '100%';
//     let geocoder_div = document.querySelector(".mapboxgl-ctrl-geocoder.mapboxgl-ctrl");
//     // geocoder_div.classList.add('form-group');
//     geocoder_div.style.minWidth = "0px";
//     geocoder_div.style.width = "100%";
//     // geocoder_div.style.maxWidth = "3600px";
//     geocoder_div.style.margin = "0px";

//     geocoder.on('result', (result) => {
//         let item = result.result;
//         console.log(item);
//         let place_name = item.place_name.replace(", United States", "");
//         geocoder.setInput(place_name);
//         if (item.place_type[0] == "postcode") {
//             document.getElementById("postcode").value = item.text;
//             document.getElementById("place").value = item.context[0].text;
//             document.getElementById("district").value = item.context[1].text;
//             document.getElementById("region").value = STATES[item.context[2].text];
//             document.getElementById("country").value = item.context[3].text;

//         } else {
//             document.getElementById("place").value = item.text;
//             if (item.context.length > 2) {
//                 document.getElementById("district").value = item.context[0].text;
//                 document.getElementById("region").value = STATES[item.context[1].text];
//                 document.getElementById("country").value = item.context[2].text;
//             } else {
//                 document.getElementById("region").value = STATES[item.context[0].text];
//                 document.getElementById("country").value = item.context[1].text;
//             }
//         }
//         document.getElementById("home-submit").focus();

//     });

// }