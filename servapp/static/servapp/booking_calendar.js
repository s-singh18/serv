let today = new Date();
let currentDay = today.getDay();
let currentDate = today.getDate();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let selectYear = document.getElementById("year");
let selectMonth = document.getElementById("month");

let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// start of week calendar
var startDay;
var startDate;
var startMonth;
var lastYear;
// day highlighted
var month_selected_element;
var week_selected_element;
var future_week_selected_id;

var selectedDay;
var selectedDate;
var selectedMonth;
var selectedYear;

// From appointment.js
var selectedServiceButton;
var selectedAppointmentButton;
var selectedAppointment_AM_PM;
var servicesExist;

var listingID = document.getElementById('listing-id').value;
let listingTitle = document.getElementById("listing-title").innerText;

var bookingButton = document.getElementById("booking-button");
var reviewButton = document.getElementById("review-button");

var reviewHeader = document.getElementById("review-header").value;
var reviewBody = document.getElementById("review-body").value;

document.addEventListener("DOMContentLoaded", function () {
    clickServiceButton();
    setCalendarMonth();
    setCalendarYear();
    showCalendar(currentMonth, currentYear);
    showWeekCalendar(currentDay, currentDate, currentMonth, currentYear);
    createBooking();
    createReview();
});

// Reload page after login or registration, send review request
window.onload = function () {
    var reloading = sessionStorage.getItem("reloading");
    var header = sessionStorage.getItem("reviewHeader");
    var body = sessionStorage.getItem("reviewBody");
    if (reloading) {
        sendReviewRequest();
        sessionStorage.removeItem("reloading");
        sessionStorage.removeItem("reviewHeader");
        sessionStorage.removeItem("reviewBody");
    }
}


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');

function setCalendarMonth() {
    let listings_header = document.getElementById('listings-header');
    listings_header.style.cursor = "pointer";
    listings_header.addEventListener('click', () => {
        document.getElementById('listings-button').click();
    })

    let month = document.getElementById('month');
    month.style.cursor = "pointer";
    for (let i = 0; i <= 11; i++) {
        let option = document.createElement('option');
        option.value = i;
        option.innerText = months[i];
        month.appendChild(option);
    }

    month.addEventListener("click", (event) => {
        event.stopPropagation();
    })
}

function setCalendarYear() {
    let year = document.getElementById('year');
    year.style.cursor = "pointer";
    for (let i = currentYear; i <= currentYear + 3; i++) {
        let option = document.createElement('option');
        option.value = i;
        option.innerText = i;
        year.appendChild(option);
        lastYear = i;
    }

    year.addEventListener("click", (event) => {
        event.stopPropagation();
    })
}


function next() {
    currentYear = (currentMonth === 11) ? currentYear + 1 : currentYear;
    currentMonth = (currentMonth + 1) % 12;
    showCalendar(currentMonth, currentYear);
}

function previous() {
    currentYear = (currentMonth === 0) ? currentYear - 1 : currentYear;
    currentMonth = (currentMonth === 0) ? 11 : currentMonth - 1;
    showCalendar(currentMonth, currentYear);
}

function jump() {
    currentYear = parseInt(selectYear.value);
    currentMonth = parseInt(selectMonth.value);
    showCalendar(currentMonth, currentYear);
}

// Collapsable calendar under the month and year header
function showCalendar(month, year) {
    // make whole header clickable
    let headingTwo = document.getElementById('headingTwo');
    headingTwo.style.cursor = "pointer";
    headingTwo.addEventListener('click', () => {
        document.getElementById("monthAndYear").click();
    });

    document.getElementById('previous-button').addEventListener('click', (event) => {
        event.stopPropagation();
    });

    document.getElementById('next-button').addEventListener('click', (event) => {
        event.stopPropagation();
    });

    let firstDay = (new Date(year, month)).getDay();
    let daysInMonth = 32 - new Date(year, month, 32).getDate();

    let tbl = document.getElementById("calendar-body"); // body of the calendar

    // clearing all previous cells
    tbl.innerText = "";

    // filing data about month and in the page via DOM.
    monthAndYear.innerText = months[month] + " " + year;
    selectYear.value = year;
    selectMonth.value = month;

    // creating all cells
    let date = 1;
    for (let i = 0; i < 6; i++) {
        // creates a table row
        let row = document.createElement("tr");

        //creating individual cells, filing them up with data.
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay || selectYear.value == "" || selectMonth == "") {
                let cell = document.createElement("td");
                let cellText = document.createTextNode('\u00A0');
                cell.appendChild(cellText);
                row.appendChild(cell);
            }
            else if (date > daysInMonth) {
                break;
            }
            else {
                let cell = document.createElement("td");
                let cellText = document.createTextNode(date);
                cell.appendChild(cellText);
                cell.className = "month-cell";
                // Store date as id
                cell.id = String(date).concat("-", String(month), "-", String(year), "-month");
                // color today's date
                if (date === today.getDate() && year === today.getFullYear() && month === today.getMonth()) {
                    cell.className = "month-cell month-selected";
                    month_selected_element = cell
                    // Add event listener to today's date
                    cell.addEventListener('click', () => {
                        // Set previous highlighted to none and highlight selected element
                        month_selected_element.className = "month-cell";
                        cell.className = "month-cell month-selected";
                        month_selected_element = cell;
                        future_week_selected_id = undefined;
                        showWeekCalendar(today.getDay(), today.getDate(), today.getMonth(), today.getFullYear());
                    });
                }
                row.appendChild(cell);

                let current_date = new Date(year, month, date);
                if (today.getTime() <= current_date.getTime()) {
                    // Add event listener to future dates
                    cell.addEventListener('click', () => {
                        // Set previous highlighted to none and highlight selected element
                        month_selected_element.className = "month-cell";
                        cell.className = "month month-selected";
                        month_selected_element = cell;
                        future_week_selected_id = undefined;
                        showWeekCalendar(current_date.getDay(), current_date.getDate(), current_date.getMonth(), current_date.getFullYear());
                    });
                }
                date++;
            }
        }
        tbl.appendChild(row); // appending each row into calendar body.
    }
}

// Week calendar that shows under the month and year header
function showWeekCalendar(day, date, month, year) {
    var year_disp = year;
    let daysInMonth = 32 - new Date(year, month, 32).getDate();
    // on load initialize week calendar with today's date and the upcoming week
    let month_disp = month + 1;
    // Calendar date
    let date_disp = date;

    let day_disp = days[day];
    // row holds week calendar elements
    let row = document.createElement("tr");

    // Create containers for left and right buttons
    let left_button = document.createElement("td");
    left_button.className = "table-button-header";
    let left_button_div = document.createElement("div");
    left_button_div.className = "table-button-container";
    let right_button_div = document.createElement("div");
    right_button_div.className = "table-button-container";

    // Create next and previous, day and week buttons for left side
    let left_week_button = document.createElement("button");
    left_week_button.className = 'btn btn-outline-info table-button';
    left_week_button.innerText = "<<";
    let left_day_button = document.createElement("button");
    left_day_button.className = 'btn btn-outline-info table-button';
    left_day_button.innerText = "<";
    left_button_div.appendChild(left_week_button);
    left_button_div.appendChild(left_day_button);
    left_button.appendChild(left_button_div);

    // Create next and previous, day and week buttons for right side
    let right_button = document.createElement("td");
    right_button.className = "table-button-header";
    let right_day_button = document.createElement("button");
    right_day_button.className = 'btn btn-outline-info table-button';
    right_day_button.innerText = ">";
    let right_week_button = document.createElement("button");
    right_week_button.className = 'btn btn-outline-info table-button';
    right_week_button.innerText = ">>";
    right_button_div.appendChild(right_day_button);
    right_button_div.appendChild(right_week_button);
    right_button.appendChild(right_button_div);

    var day_count = 1;
    let th = document.createElement("td");
    th.innerHTML = `<h6 class="week-date">${month_disp}/${date_disp}</h6>
                    <p class="week-day">${day_disp}</p>`;
    th.id = String(date).concat("-", String(month), "-", String(year_disp));;
    if (future_week_selected_id == undefined) {
        th.className = "week-cell week-selected";
        week_selected_element = th;
        setSelectedDates(day, date, month, year);
    } else {
        th.className = "week-cell";
    }


    th.addEventListener('click', () => {
        week_selected_element.className = "week-cell";
        th.className = "week-cell week-selected";
        week_selected_element = th;
        let date_elements = week_selected_element.id.split("-");
        let selected_month = parseInt(date_elements[1]);
        let selected_year = parseInt(date_elements[2]);
        if (selected_month != selectMonth.value || selected_year != selectYear.value) {
            selectMonth.value = selected_month;
            selectYear.value = selected_year;
            jump();
        }
        let month_element = document.getElementById(week_selected_element.id.concat("-month"));
        month_selected_element.className = "month-cell";
        month_element.className = "month-cell month-selected";
        month_selected_element = month_element;
        future_week_selected_id = undefined;
        setSelectedDates(day, date, month, year);
    });

    row.appendChild(th);

    // Refers to day of the week
    let day_index = day;
    if (day_index == 6) {
        day_index = 0;
    } else {
        day_index++;
    }
    date_disp++;

    // Create row calendar for the rest of the week 
    let out_of_bounds = false;
    while (day_index != day) {
        day_count++;
        let td = document.createElement("td");
        if (date_disp > daysInMonth) {
            date_disp = 1;
            month_disp = month_disp + 1;
            if (month_disp > 12 && year_disp + 1 <= lastYear) {
                month_disp = 1;
                year_disp = year_disp + 1;
            } else if (month_disp > 12 && year_disp + 1 > lastYear) {
                out_of_bounds = true;
            } else {
                out_of_bounds = false;
            }
        }

        if (out_of_bounds == false) {
            td.id = String(date_disp).concat("-", String(month_disp - 1), "-", String(year_disp));
            td.className = "week-cell";
            day_disp = days[day_index];
            td.innerHTML = `<h6 class="week-date">${month_disp}/${date_disp}</h6>
                            <p class="week-day">${day_disp}</p>`;
            td.addEventListener('click', () => {
                week_selected_element.className = "week-cell";
                td.className = "week-cell week-selected";
                week_selected_element = td;
                let date_elements = week_selected_element.id.split("-");
                let selected_date = parseInt(date_elements[0]);
                let selected_month = parseInt(date_elements[1]);
                let selected_year = parseInt(date_elements[2]);
                if (selected_month != selectMonth.value || selected_year != selectYear.value) {
                    selectMonth.value = selected_month;
                    selectYear.value = selected_year;
                    jump();
                }
                let month_element = document.getElementById(week_selected_element.id.concat("-month"));
                month_selected_element.className = "month-cell";
                month_element.className = "month-cell month-selected";
                month_selected_element = month_element;
                future_week_selected_id = undefined;
                let new_date = new Date(selected_year, selected_month, selected_date);
                setSelectedDates(new_date.getDay(), selected_date, selected_month, selected_year);
            });
        } else {
            td.innerHTML = `<h6 class="week-date">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</h6>
                            <p class="week-day">&nbsp;&nbsp;&nbsp;</p>`;
        }
        row.appendChild(td);

        if (day_index == 6) {
            day_index = 0;
        } else {
            day_index++;
        }
        date_disp++;
    }

    let week_head = document.querySelector('.week-head');
    // clear previous table
    week_head.innerText = "";
    week_head.appendChild(row);
    // If arrow buttons used to change week view
    if (future_week_selected_id != undefined) {
        updateSelectedElements(future_week_selected_id);
    }

    row.prepend(left_button);
    row.appendChild(right_button);



    right_day_button.addEventListener('click', () => {
        let date_elements = week_selected_element.id.split("-");
        let selected_date = parseInt(date_elements[0]);
        let selected_month = parseInt(date_elements[1]);
        let selected_year = parseInt(date_elements[2]);
        let month_days = 32 - new Date(selected_year, selected_month, 32).getDate();
        let date_string = String(selected_date).concat("-", String(selected_month), "-", String(selected_year));
        // Not the last day of the calendar
        if (selected_date == 31 && selected_month == 11 && selected_year == lastYear) {
        }
        else {
            selected_date++;
            if (selected_date > month_days) {
                selected_date = 1;
                if (selected_month == 11) {
                    selected_month = 0;
                    selected_year++;
                } else {
                    selected_month++;
                }
                selectMonth.value = selected_month;
                selectYear.value = selected_year;
                jump();
            }
            let start_day = day + 1;
            if (start_day > 6) {
                start_day = 0;
            }
            let start_date = date + 1;
            let start_month = month;
            let start_year = year;
            month_days = 32 - new Date(start_year, start_month, 32).getDate();
            if (start_date > month_days) {
                start_date = (start_date - month_days);
                if (start_month == 11) {
                    start_month = 0;
                    start_year++;
                } else {
                    start_month++;
                }
            }
            date_string = String(selected_date).concat("-", String(selected_month), "-", String(selected_year));
            let new_week_selected_element = document.getElementById(date_string);
            // check if date exists in week calendar, update week calendar
            if (new_week_selected_element == null) {
                future_week_selected_id = date_string;
                let current_date = new Date(selected_year, selected_month, selected_date);
                showWeekCalendar(start_day, start_date, start_month, start_year);
            } else {
                updateSelectedElements(date_string);
            }
        }
    });

    right_week_button.addEventListener('click', () => {
        let date_elements = week_selected_element.id.split("-");
        let selected_date = parseInt(date_elements[0]);
        let selected_month = parseInt(date_elements[1]);
        let selected_year = parseInt(date_elements[2]);
        let month_days = 32 - new Date(selected_year, selected_month, 32).getDate();
        // Not the last day of the calendar
        if (selected_date >= 25 && selected_month == 11 && selected_year == lastYear) {
        }
        else {
            selected_date = selected_date + 7;
            if (selected_date > month_days) {
                selected_date = (selected_date - month_days);
                if (selected_month == 11) {
                    selected_month = 0;
                    selected_year++;
                } else {
                    selected_month++;
                }
                selectMonth.value = selected_month;
                selectYear.value = selected_year;
                jump();
            }
            let start_date = date + 7;
            let start_month = month;
            let start_year = year;
            month_days = 32 - new Date(start_year, start_month, 32).getDate();
            if (start_date > month_days) {
                start_date = (start_date - month_days);
                if (start_month == 11) {
                    start_month = 0;
                    start_year++;
                } else {
                    start_month++;
                }
            }

            date_string = String(selected_date).concat("-", String(selected_month), "-", String(selected_year));
            let new_week_selected_element = document.getElementById(date_string);
            // check if date exists in week calendar, update week calendar
            if (new_week_selected_element == null) {
                future_week_selected_id = date_string;
                let current_date = new Date(selected_year, selected_month, selected_date);
                showWeekCalendar(day, start_date, start_month, start_year);
            } else {
                updateSelectedElements(date_string);
            }
        }
    });

    left_day_button.addEventListener('click', () => {
        let date_elements = week_selected_element.id.split("-");
        let selected_date = parseInt(date_elements[0]);
        let selected_month = parseInt(date_elements[1]);
        let selected_year = parseInt(date_elements[2]);
        let month_days = 32 - new Date(year, month, 32).getDate();
        // Not today
        if (selected_date == today.getDate() && selected_month == today.getMonth() && selected_year == today.getFullYear()) {
        }
        else {
            selected_date--;
            if (selected_date < 1) {
                if (selected_month == 0) {
                    selected_month = 11;
                    selected_year--;
                } else {
                    selected_month--;
                }
                selectMonth.value = selected_month;
                selectYear.value = selected_year;
                jump();
                selected_date = 32 - new Date(selected_year, selected_month, 32).getDate();

            }
            date_string = String(selected_date).concat("-", String(selected_month), "-", String(selected_year));
            let new_week_selected_element = document.getElementById(date_string);
            // check if date exists in week calendar, update week calendar
            if (new_week_selected_element == null) {
                future_week_selected_id = date_string;
                let current_date = new Date(selected_year, selected_month, selected_date);
                showWeekCalendar(current_date.getDay(), current_date.getDate(), current_date.getMonth(), current_date.getFullYear());
            } else {
                updateSelectedElements(date_string);
            }
        }
    });

    left_week_button.addEventListener('click', () => {
        let date_elements = week_selected_element.id.split("-");
        let selected_date = parseInt(date_elements[0]);
        let start_date = date;
        let selected_month = parseInt(date_elements[1]);
        let start_month = month;
        let selected_year = parseInt(date_elements[2]);
        let start_year = year;
        let month_days = 32 - new Date(year, month, 32).getDate();
        selected_date = selected_date - 7;
        if (selected_date < 1) {
            if (selected_month == 0) {
                selected_month = 11;
                selected_year--;
            } else {
                selected_month--;
            }
            selectMonth.value = selected_month;
            selectYear.value = selected_year;
            jump();
            selected_date = (32 - new Date(selected_year, selected_month, 32).getDate()) + selected_date;
        }
        let new_selected = new Date(selected_year, selected_month, selected_date);

        if (new_selected.getTime() > today.getTime() || (today.getDate() == new_selected.getDate() && today.getMonth() == new_selected.getMonth() && today.getFullYear() == new_selected.getFullYear())) {
            start_date = start_date - 7;
            if (start_date < 1) {
                if (start_month == 0) {
                    start_month = 11;
                    start_year--;
                } else {
                    start_month--;
                }
                month_days = 32 - new Date(start_year, start_month, 32).getDate();
                start_date = month_days + start_date;
            }
            let new_start = new Date(start_year, start_month, start_date);
            if (today.getTime() >= new_start.getTime() || (today.getDate() == new_start.getDate() && today.getMonth() == new_start.getMonth() && today.getFullYear() == new_start.getFullYear())) {
                new_start = today;
                start_date = today.getDate();
                start_month = today.getMonth();
                start_year = today.getFullYear();
            }
            date_string = String(selected_date).concat("-", String(selected_month), "-", String(selected_year));
            let new_week_selected_element = document.getElementById(date_string);
            // check if date exists in week calendar, update week calendar
            if (new_week_selected_element == null) {
                future_week_selected_id = date_string;
                let current_date = new Date(selected_year, selected_month, selected_date);
                showWeekCalendar(day, start_date, start_month, start_year);
            } else {
                updateSelectedElements(date_string);
            }
        }
    });
}

// update elements in week and month calendar without changing the week or month calendar view
function updateSelectedElements(date_string) {
    let new_week_selected_element = document.getElementById(date_string);
    let new_month_selected_element = document.getElementById(date_string.concat("-month"));
    let date_elements = date_string.split("-");
    let selected_date = parseInt(date_elements[0]);
    let selected_month = parseInt(date_elements[1]);
    let selected_year = parseInt(date_elements[2]);
    if (new_month_selected_element == null) {
        selectMonth.value = selected_month;
        selectYear.value = selected_year;
        jump();
        new_month_selected_element = document.getElementById(date_string.concat("-month"));
    }
    let new_date = new Date(selected_year, selected_month, selected_date);
    setSelectedDates(new_date.getDay(), new_date.getDate(), new_date.getMonth(), new_date.getFullYear());
    week_selected_element.className = "week-cell";
    month_selected_element.className = "month-cell";
    new_week_selected_element.className = "week-cell week-selected";
    new_month_selected_element.className = "month-cell month-selected"
    week_selected_element = new_week_selected_element;
    month_selected_element = new_month_selected_element;
    future_week_selected_id = undefined;
}

function setSelectedDates(day, date, month, year) {
    selectedDay = day;
    selectedDate = date;
    selectedMonth = month;
    selectedYear = year;
    // On new selected days load appointments for that day
    if (servicesExist == true) {
        loadAppointments()
    }

}

// From appointments.js
function clickServiceButton() {
    let service_buttons = Array.from(document.getElementsByClassName('service-button'));
    if (service_buttons.length == 0) {
        let appointment_body = document.getElementById("appointment-body");
        let p = document.create
        appointment_body.innerText = "No Appointments";
        servicesExist = false;
    } else {
        // Load appointments for first element
        selectedServiceButton = service_buttons[0];
        selectedServiceButton.disabled = true;
        selectedServiceButton.classList.add("active");
        servicesExist = true;

        // add click event listener and button presser to all elements
        service_buttons.forEach(element => {
            // First element

            // Listen to each button to see if it is clicked
            element.addEventListener('click', () => {
                selectedServiceButton.disabled = false;
                selectedServiceButton.classList.remove("active");
                selectedServiceButton = element;
                selectedServiceButton.disabled = true;
                selectedServiceButton.classList.add("active");
                loadAppointments();
            });
        });
    }
    let index = 0;

}

function loadAppointments() {
    selectedAppointmentButton = undefined;
    selectedAppointment_AM_PM = undefined;
    bookingButton.disabled = true;
    fetch(`/get_appointments/${listingID}/${selectedServiceButton.nextElementSibling.value}/${selectedDay}/${selectedDate}/${selectedMonth}/${selectedYear}`)
        .then(response => response.json())
        .then(result => {
            let appointment_am = document.getElementById('appointment-am');
            let appointment_pm = document.getElementById('appointment-pm');
            appointment_am.innerText = "";
            appointment_pm.innerText = "";
            let am_appointments = result.am_appointments;
            let pm_appointments = result.pm_appointments;
            let am_count = 0;
            if (am_appointments != '') {
                am_appointments.forEach(element => {
                    let button = document.createElement('input');
                    button.type = "button";
                    button.className = "btn btn-primary btn-sm appointment-button";
                    button.value = `${element}`;
                    appointment_am.appendChild(button);
                    button.addEventListener('click', () => {
                        if (selectedAppointmentButton == undefined) {
                            selectedAppointmentButton = button;
                            selectedAppointmentButton.classList.add('active');
                            selectedAppointmentButton.disabled = true;
                            selectedAppointment_AM_PM = "AM";
                            bookingButton.disabled = false;
                        } else {
                            selectedAppointmentButton.classList.remove('active');
                            selectedAppointmentButton.disabled = false;
                            selectedAppointmentButton = button;
                            selectedAppointmentButton.classList.add('active');
                            selectedAppointmentButton.disabled = true;
                            selectedAppointment_AM_PM = "AM";
                            bookingButton.disabled = false;
                        }

                    });
                    am_count++;
                });
            }

            let pm_count = 0;
            if (result.pm_appointments != '') {
                result.pm_appointments.forEach(element => {
                    let button = document.createElement('input');
                    button.type = "button";
                    button.className = "btn btn-primary btn-sm appointment-button";
                    button.value = `${element}`;
                    appointment_pm.appendChild(button);
                    button.addEventListener('click', () => {
                        if (selectedAppointmentButton == undefined) {
                            selectedAppointmentButton = button;
                            selectedAppointmentButton.classList.add('active');
                            selectedAppointmentButton.disabled = true;
                            selectedAppointment_AM_PM = "PM";
                            bookingButton.disabled = false;
                        } else {
                            selectedAppointmentButton.classList.remove('active');
                            selectedAppointmentButton.disabled = false;
                            selectedAppointmentButton = button;
                            selectedAppointmentButton.classList.add('active');
                            selectedAppointmentButton.disabled = true;
                            selectedAppointment_AM_PM = "PM";
                            bookingButton.disabled = false;
                        }
                    });


                });
            }

            // Dynamically set heights of appointment containers
            // if (appointment_am.style.height > appointment_pm.style.height) {
            //     appointment_pm.style.height = appointment_am.style.height;
            // } else if (appointment_pm.style.height > appointment_am.style.height) {
            //     appointment_am.style.height = appointment_pm.style.height;
            // }
        });
}

// Only triggered when appointment is selected and booking button is clicked
function createBooking() {
    bookingButton.disabled = true;
    bookingButton.setAttribute("data-toggle", "modal");
    bookingButton.setAttribute("data-target", "#exampleModalCenter");
    bookingButton.addEventListener('click', () => {
        if (selectedAppointmentButton != undefined) {
            if (document.getElementById('login')) {
                let request_type = "Booking";
                loadLoginModal(request_type);
            } else {
                sendBookingRequest();
            }

        }
    });
}

function createReview() {
    reviewButton.setAttribute("data-toggle", "modal");
    reviewButton.setAttribute("data-target", "#exampleModalCenter");
    reviewButton.addEventListener('click', (event) => {
        event.preventDefault();
        if (document.getElementById('login')) {
            let request_type = "Review";
            let errors = reviewValidation();
            if (errors) {
                showErrors(errors)
            } else {
                loadLoginModal(request_type);
            }

        } else {
            event.stopPropagation();
            sendReviewRequest();
        }
    });
}

function loadLoginModal(requestType) {
    let modal_title = document.getElementById('exampleModalLongTitle');
    modal_title.innerText = "Login";

    let modal_body = document.getElementById('exampleModalBody');
    modal_body.innerHTML = ``;

    let form_errors = document.createElement('form-errors');
    modal_body.appendChild(form_errors);

    let email_div = document.createElement('div');
    email_div.className = "form-group";
    modal_body.appendChild(email_div);

    let email_input = document.createElement('input');
    email_input.className = "form-control";
    email_input.type = "email";
    email_input.name = "email";
    email_input.placeholder = "Email";
    email_div.appendChild(email_input)

    let password_div = document.createElement('div');
    password_div.className = "form-group";
    modal_body.appendChild(password_div);

    let password_input = document.createElement('input');
    password_input.className = "form-control";
    password_input.type = "password";
    password_input.name = "password";
    password_input.placeholder = "Password";
    password_div.appendChild(password_input)

    let paragraph = document.createElement('p');
    paragraph.innerText = "Don't have an account?  ";

    let register_link = document.createElement('a');
    register_link.className = "register-link";
    register_link.innerText = "Register here.";
    register_link.href = "#";
    register_link.role = "button";
    paragraph.appendChild(register_link);
    modal_body.appendChild(paragraph);

    let modal_footer = document.getElementById('exampleModalFooter');
    modal_footer.innerHTML = ``;
    let login_button = document.createElement('button');
    login_button.className = "btn btn-primary modal-button";
    login_button.innerText = "Login";
    modal_footer.appendChild(login_button);

    register_link.addEventListener('click', (event) => {
        event.preventDefault();
        loadRegisterModal(requestType);
    });

    login_button.addEventListener('click', () => {
        let csrf = getCookie('csrftoken')
        let login_request = new Request(
            '/login',
            { headers: { 'X-CSRFToken': csrf } }
        );
        fetch(login_request, {
            method: "POST",
            body: JSON.stringify({
                email: email_input.value,
                password: password_input.value,
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    form_errors.innerHTML = ``;

                    let error = document.createElement('li');
                    error.className = "error";
                    error.innerText = data.error;
                    let br = document.createElement('br');

                    form_errors.appendChild(error);
                    form_errors.appendChild(br);
                    return false;
                } else {
                    document.getElementById('close-button').click();
                    // Review Request
                    if (requestType == "Review") {
                        sessionStorage.setItem("reloading", "true");
                        sessionStorage.setItem("header", reviewHeader)
                        sessionStorage.setItem("body", reviewBody)
                        location.reload();
                    }
                    // Booking Request
                    if (requestType == "Booking") {
                        sendBookingRequest();
                    }
                }
            });
    });
}

function loadRegisterModal(requestType) {
    let modal_title = document.getElementById('exampleModalLongTitle');
    modal_title.innerText = "Register";

    let modal_body = document.getElementById('exampleModalBody');
    modal_body.innerHTML = ``;

    let form_errors = document.createElement('div');
    modal_body.appendChild(form_errors);

    let user_div = document.createElement('div');
    user_div.className = "form-group";
    modal_body.appendChild(user_div);

    let user_input = document.createElement('input');
    user_input.className = "form-control";
    user_input.type = "text";
    user_input.name = "username";
    user_input.placeholder = "Name";
    user_div.appendChild(user_input);

    let email_div = document.createElement('div');
    email_div.className = "form-group";
    modal_body.appendChild(email_div);

    let email_input = document.createElement('input');
    email_input.className = "form-control";
    email_input.type = "email";
    email_input.name = "email";
    email_input.placeholder = "Email";
    email_div.appendChild(email_input)

    let password_div = document.createElement('div');
    password_div.className = "form-group";
    modal_body.appendChild(password_div);

    let password_input = document.createElement('input');
    password_input.className = "form-control";
    password_input.type = "password";
    password_input.name = "password";
    password_input.placeholder = "Password";
    password_div.appendChild(password_input)

    let confirm_div = document.createElement('div');
    confirm_div.className = "form-group";
    modal_body.appendChild(confirm_div);

    let confirm_input = document.createElement('input');
    confirm_input.className = "form-control";
    confirm_input.type = "password";
    confirm_input.name = "confirmation";
    confirm_input.placeholder = "Confirm Password";
    confirm_div.appendChild(confirm_input)

    let paragraph = document.createElement('p');
    paragraph.innerText = "Already have an account?  ";

    let login_link = document.createElement('a');
    login_link.className = "register-link";
    login_link.innerText = "Login here.";
    login_link.href = "#";
    login_link.role = "button";
    paragraph.appendChild(login_link);
    modal_body.appendChild(paragraph);

    let modal_footer = document.getElementById('exampleModalFooter');
    modal_footer.innerHTML = ``;
    let register_button = document.createElement('button');
    register_button.className = "btn btn-primary modal-button";
    register_button.innerText = "Register";
    modal_footer.appendChild(register_button);

    login_link.addEventListener('click', (event) => {
        event.preventDefault();
        loadLoginModal(requestType);
    });

    register_button.addEventListener('click', () => {
        let csrf = getCookie('csrftoken');
        let register_request = new Request(
            '/register',
            { headers: { 'X-CSRFToken': csrf } }
        );
        fetch(register_request, {
            method: "POST",
            body: JSON.stringify({
                username: user_input.value,
                email: email_input.value,
                password: password_input.value,
                confirmation: confirm_input.value,
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    form_errors.innerHTML = ``;

                    let error = document.createElement('li');
                    error.className = "error";
                    error.innerText = data.error;
                    let br = document.createElement('br');

                    form_errors.appendChild(error);
                    form_errors.appendChild(br);
                    return false;
                } else {
                    document.getElementById('close-button').click();
                    if (requestType == "Review") {
                        sessionStorage.setItem("reloading", "true");
                        sessionStorage.setItem("header", reviewHeader)
                        sessionStorage.setItem("body", reviewBody)
                        location.reload();
                    }

                    if (requestType == "Booking") {
                        sendBookingRequest();
                    }
                }
            });
    });
}

function loadSuccessModal() {
    let modal_title = document.getElementById('exampleModalLongTitle');
    modal_title.innerText = "Success";

    let modal_body = document.getElementById('exampleModalBody');
    modal_body.innerHTML = ``;

    let success = document.createElement('p');
    success.innerText = "Created a booking at " + selectedAppointmentButton.value + " " + selectedAppointment_AM_PM + ", " + days[selectedDay] + " " + String(selectedMonth) + "/" + String(selectedDate) + " for " + selectedServiceButton.id + " with " + listingTitle + ".  View at your ";
    let profile_link = document.createElement('a');
    let url = window.location.origin;
    profile_link.className = "register-link";
    profile_link.href = url + "/profile";
    profile_link.innerText = "profile."
    success.appendChild(profile_link);
    modal_body.appendChild(success);


    let modal_footer = document.getElementById('exampleModalFooter');
    modal_footer.innerHTML = ``;

    selectedAppointmentButton.remove();
    selectedAppointmentButton = undefined;
    selectedAppointment_AM_PM = undefined;

}

function sendBookingRequest() {
    let csrf = getCookie('csrftoken');
    let new_booking_request = new Request(
        '/create_booking',
        { headers: { 'X-CSRFToken': csrf } }
    );

    // Create booking post request
    fetch(new_booking_request, {
        method: "POST",
        body: JSON.stringify({
            listing_id: listingID,
            service_id: selectedServiceButton.nextElementSibling.value,
            time: selectedAppointmentButton.value,
            am_pm: selectedAppointment_AM_PM,
            day: selectedDay,
            date: String(selectedDate),
            month: String(selectedMonth + 1),
            year: String(selectedYear),
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                let request_type = "Booking";
                loadLoginModal(request_type);
            } else {
                loadSuccessModal();
                $('#exampleModalCenter').on('hidden.bs.modal', function () {
                    location.reload();
                })
            }
        });
}

function sendReviewRequest() {
    let csrf = getCookie('csrftoken');
    let errors = reviewValidation();
    if (errors.length > 0) {
        let review_body;
        let review_header;
        if (sessionStorage.getItem('reloading')) {
            review_header = sessionStorage.getItem('reviewHeader');
            review_body = sessionStorage.getItem('reviewBody');
        } else {
            review_header = reviewHeader;
            review_body = reviewBody;
        }
        let create_request = new Request(
            '/listing/' + listingTitle + "/" + listingID,
            { headers: { 'X-CSRFToken': csrf } }
        );

        // Create booking post request
        fetch(create_request, {
            method: "POST",
            body: JSON.stringify({
                header: review_header,
                body: review_body,
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.errors) {
                    showErrors(data.errors);
                }
            });
    } else {
        showErrors(errors);
    }
}

function reviewValidation() {
    let errors = [];
    if (checkHeader != undefined) {
        errors.push(checkHeader);
    }
    if (checkBody != undefined) {
        errors.push(checkBody);
    }
    if (getReview != undefined) {
        errors.push(getReview);
    }
    return errors
}

function showErrors(errors) {
    let div_errors = document.getElementById('errors');
    div_errors.innerHTML = ``;
    errors.forEach(error => {
        let li = document.createElement('li');
        li.className = "error";
        li.innerText = error;
        div_errors.appendChild(li);
    });
}

function checkHeader() {
    let header = reviewHeader;
    // body: document.getElementById('review-body').value;
    let error;
    if (header == "") {
        error = "No header given";
    } else if (header.length > 300) {
        error = "Max review header length 300 characters";
    } else if (header.trim().length) {
        error = "Invalid review header";
    } else {
        error = undefined
    }
    return error
}

function checkBody() {
    let body = reviewBody;
    // body: document.getElementById('review-body').value;
    let error;
    if (body == "") {
        error = "No body given";
    } else if (body.length > 300) {
        error = "Max review body length 6000 characters";
    } else if (body.trim().length) {
        error = "Invalid review body";
    } else {
        error = undefined
    }
    return error
}

function getReview() {
    // Create booking post request
    fetch(`/get-review/{listingID}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                return data.error
            }
        });
}