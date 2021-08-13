var accessToken = document.querySelector('#mapbox-access-token').value;

var postcode = document.getElementById("postcode");
var place = document.getElementById("place");
var district = document.getElementById("district");
var region = document.getElementById("region");
var country = document.getElementById("country");


var listingDiv = document.getElementById("listing-div");
var listingInput = document.getElementById("listing-input");
var listingSuggestions = document.getElementById("listing-suggestions");

var prevLocation = "";
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
    listingSuggestions.style.display = "none";
    listingInput.addEventListener("keyup", (e) => {
        console.log(e);
        let results = [];
        // console.log(input)
        if (listingInput.value.length) {
            let count = 0;
            listingSuggestions.style.display = "block";
            // item => item.toLowerCase().includes(listingInput.value.toLowerCase())
            let services_list_copy = SERVICES_LIST.slice();
            results = Array.from(filter(services_list_copy, item => item.substring(0, listingInput.value.length).toLowerCase().includes(listingInput.value.toLowerCase()), item => item.toLowerCase().includes(listingInput.value.toLowerCase()), 5));
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
        if (!withinBoundaries) {
            console.log(event.composedPath());
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
    locationSuggestions.style.display = "none";
    locationInput.addEventListener("keyup", (e) => {
        let place = locationInput.value;
        if (place.length > 0 && prevLocation != place) {
            prevLocation = place;
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
                                setSearchParams(feature)
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

function setSearchParams(feature) {
    console.log(feature);
    

}

function* filter(array, condition1, condition2, maxSize) {
    if (!maxSize || maxSize > array.length) {
        maxSize = array.length;
    }
    let count = 0;
    let i = 0;
    console.log(array[i]);
    while (count < maxSize && i < array.length) {
        if (condition1(array[i])) {
            yield array[i];
            // delete array[i]
            count++;
        }
        i++;
    }

    // i = 0;
    // while (count < maxSize && i < array.length) {
    //     if (condition2(array[i])) {
    //         yield array[i];
    //         count++;
    //     }
    //     i++;
    // }
}

function addElement(e, input, suggestions, div, type, values, dropdown) {
    dropdown.remove()
    let category_text = e.toElement.innerText;
    let p = document.createElement("p");
    p.className = type + "-item";
    p.innerText = category_text;
    div.appendChild(p);
    values.push(category_text);
    let remove = document.createElement("a");
    remove.className = "remove-item";
    remove.href = "javascript:;";
    remove.innerText = "Remove";
    p.appendChild(remove);
    let len = document.querySelectorAll('.' + type + '-item').length;
    if (len < CATEGORY_AMOUNT) {
        addElementLink(div, type);
    }

    remove.addEventListener("click", (e) => {
        console.log(e);
        p.remove();
        let index = values.lastIndexOf(category_text);
        if (index !== -1) {
            values.splice(index, 1);
        }
        if (document.querySelector('.' + type + '-item') == null) {
            let new_input = createInput(type);
            let new_suggestions = createSuggestions(type);
            let new_dropdown = document.createElement("div");
            new_dropdown.className = "dropdown indent-input";
            document.querySelector('.' + type + '-link').remove();
            new_dropdown.appendChild(new_input);
            new_dropdown.appendChild(new_suggestions);
            div.appendChild(new_dropdown);
            setCategories(new_input, new_suggestions, div, new_dropdown);
        } else if (document.querySelector('.' + type + '-link') == null) {
            console.log("Add element link");
            // document.querySelector('.' + type + 'link').remove();
            addElementLink(div, type);
        }
    });
}



function addElementLink(div, type) {
    let a = document.createElement('a');
    a.href = "javascript:;";
    a.className = type + "-link";
    a.innerText = "Add another " + type;
    div.appendChild(a);
    a.addEventListener('click', () => {
        let input = createInput(type);
        let sug = createSuggestions(type)

        let dropdown = document.createElement("div");
        dropdown.className = "dropdown indent-input";
        div.removeChild(a);
        div.appendChild(dropdown);
        dropdown.appendChild(input);
        dropdown.appendChild(sug);
        setCategories(input, sug, div, dropdown);
    });
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

// For create_listing and edit_listing
function createInput(type) {
    let input = document.createElement('input');
    input.className = "form-control input-group dropdown-toggle";
    input.id = type;
    input.type = "text";
    input.name = type;
    input.placeholder = type.charAt(0).toUpperCase() + type.substr(1).toLowerCase();
    input.setAttribute("data-toggle", "dropdown");
    input.setAttribute("aria-haspopup", "true");
    input.setAttribute("aria-expanded", "false");
    return input
}

function createSuggestions(type) {
    let sug = document.createElement("div");
    sug.className = "dropdown-menu";
    sug.id = type + "-suggestions";
    sug.setAttribute("role", "menu");
    return sug;
}
