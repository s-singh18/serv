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


document.addEventListener("DOMContentLoaded", function () {
    setGeocoder();
    setListingSearch();

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
    listingSuggestions.classList.remove("show");
    listingInput.addEventListener("keyup", (e) => {
        console.log(e);
        let results = [];
        let input = listingInput.value;
        // console.log(input)
        if (input.length) {
            let count = 0;
            results = Array.from(filter(SERVICES_LIST, item => item.toLowerCase().includes(input.toLowerCase()), 5));
            listingSuggestions.classList.add("show");
            console.log(results);
            renderResults(results, input);
        } else {
            listingSuggestions.classList.remove("show");
            listingInput.setAttribute("aria-expanded", "false");
        }
        if (e.key == "Escape") {
            listingSuggestions.classList.remove("show");
            listingInput.setAttribute("aria-expanded", "false");
        }
    });

    listingInput.addEventListener("click", () => {
        if (listingInput.value.length == 0) {
            console.log("No show");
            listingSuggestions.classList.remove("show");
            listingInput.setAttribute("aria-expanded", "false");
        }
    });
}



const array = [1, 2, 3, 4, 5, 6, 7, 8, 9];

console.log(Array.from(filter(array, i => i % 2 === 0, 2))); // expect 2 & 4


function renderResults(results, input) {
    listingSuggestions.innerHTML = ``;
    if (input.length == 0) {
        listingSuggestions.classList.remove("show");
        listingInput.setAttribute("aria-expanded") = "false";
    }
    if (results.length == 0) {
        return listingSuggestions.innerHTML = `<li class="dropdown-item"><a>No results found for query <b>"${input}"</b></a></li>`;
    }
    let content = results.map((item) => {
        let li = document.createElement("li");
        li.className = "dropdown-item";
        li.innerHTML = `<a class="dropdown-link">${item}</a>`;
        return li;
    });
    console.log(content);
    let count = 0;
    content.forEach((item) => {
        // if (count == 0) {
        //     item.classList.add("active");
        //     count += 1;
        // }

        item.addEventListener('click', (e) => {
            console.log(e)
            listingInput.value = e.toElement.innerText;
            listingSuggestions.classList.remove("show");
        });
        listingSuggestions.appendChild(item);
    });

}
