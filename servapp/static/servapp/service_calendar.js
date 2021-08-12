let serviceToday = new Date();
let serviceCurrentDay = serviceToday.getDay();
let serviceCurrentDate = serviceToday.getDate();
let serviceCurrentMonth = serviceToday.getMonth();
let serviceCurrentYear = serviceToday.getFullYear();
let serviceSelectYear = document.getElementById("service-year");
let serviceSelectMonth = document.getElementById("service-month");

let serviceMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let serviceDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// start of week calendar
var serviceStartDay;
var serviceStartDate;
var serviceStartMonth;
var serviceLastYear;
// day highlighted
var serviceMonthSelectedElement;
var serviceWeekSelectedElement;
var serviceFutureWeekSelectedId;

var serviceSelectedDay;
var serviceSelectedDate;
var serviceSelectedMonth;
var serviceSelectedYear;


document.addEventListener("DOMContentLoaded", function () {
    setServiceCalendarMonth();
    setServiceCalendarYear();
    showServiceCalendar(serviceCurrentMonth, serviceCurrentYear);
    showServiceWeekCalendar(serviceCurrentDay, serviceCurrentDate, serviceCurrentMonth, serviceCurrentYear);

});

function setServiceCalendarMonth() {
    let month = document.getElementById('service-month');
    month.style.cursor = "pointer";
    for (let i = 0; i <= 11; i++) {
        let option = document.createElement('option');
        option.value = i;
        option.innerText = serviceMonths[i];
        month.appendChild(option);
    }

    month.addEventListener("click", (event) => {
        event.stopPropagation();
    })
}

function setServiceCalendarYear() {
    let year = document.getElementById('service-year');
    year.style.cursor = "pointer";
    for (let i = serviceCurrentYear; i <= serviceCurrentYear + 3; i++) {
        let option = document.createElement('option');
        option.value = i;
        option.innerText = i;
        year.appendChild(option);
        serviceLastYear = i;
    }

    year.addEventListener("click", (event) => {
        event.stopPropagation();
    })
}


function serviceNext() {
    serviceCurrentYear = (serviceCurrentMonth === 11) ? serviceCurrentYear + 1 : serviceCurrentYear;
    serviceCurrentMonth = (serviceCurrentMonth + 1) % 12;
    showServiceCalendar(serviceCurrentMonth, serviceCurrentYear);
}

function servicePrevious() {
    serviceCurrentYear = (serviceCurrentMonth === 0) ? serviceCurrentYear - 1 : serviceCurrentYear;
    serviceCurrentMonth = (serviceCurrentMonth === 0) ? 11 : serviceCurrentMonth - 1;
    showServiceCalendar(serviceCurrentMonth, serviceCurrentYear);
}

function serviceJump() {
    serviceCurrentYear = parseInt(serviceSelectYear.value);
    serviceCurrentMonth = parseInt(serviceSelectMonth.value);
    showServiceCalendar(serviceCurrentMonth, serviceCurrentYear);
}

// Collapsable calendar under the month and year header
function showServiceCalendar(serviceMonth, serviceYear) {
    // make whole header clickable
    let headingOne = document.getElementById('headingOne');
    headingOne.style.cursor = "pointer";
    let service_month_year = document.getElementById("service-month-year");
    headingOne.addEventListener('click', () => {
        service_month_year.click();
    });

    document.getElementById('service-previous-button').addEventListener('click', (event) => {
        event.stopPropagation();
    });

    document.getElementById('service-next-button').addEventListener('click', (event) => {
        event.stopPropagation();
    });

    let firstDay = (new Date(serviceYear, serviceMonth)).getDay();
    let daysInMonth = 32 - new Date(serviceYear, serviceMonth, 32).getDate();

    let tbl = document.getElementById("service-calendar-body"); // body of the calendar

    // clearing all servicePrevious cells
    tbl.innerHTML = "";

    // filing data about month and in the page via DOM.
    service_month_year.innerHTML = serviceMonths[serviceMonth] + " " + serviceYear;
    serviceSelectYear.value = serviceYear;
    serviceSelectMonth.value = serviceMonth;

    // creating all cells
    let date = 1;
    for (let i = 0; i < 6; i++) {
        // creates a table row
        let row = document.createElement("tr");

        //creating individual cells, filing them up with data.
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay || serviceSelectYear.value == "" || serviceSelectMonth == "") {
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
                cell.id = String(date).concat("-", String(serviceMonth), "-", String(serviceYear), "-service-month");
                // color serviceToday's date
                if (date === serviceToday.getDate() && serviceYear === serviceToday.getFullYear() && serviceMonth === serviceToday.getMonth()) {
                    cell.className = "month-cell month-selected";
                    serviceMonthSelectedElement = cell
                    // Add event listener to serviceToday's date
                    cell.addEventListener('click', () => {
                        // Set servicePrevious highlighted to none and highlight selected element
                        serviceMonthSelectedElement.className = "month-cell";
                        cell.className = "month-cell month-selected";
                        serviceMonthSelectedElement = cell;
                        serviceFutureWeekSelectedId = undefined;
                        showServiceWeekCalendar(serviceToday.getDay(), serviceToday.getDate(), serviceToday.getMonth(), serviceToday.getFullYear());
                    });
                }
                row.appendChild(cell);

                let current_date = new Date(serviceYear, serviceMonth, date);
                if (serviceToday.getTime() <= current_date.getTime()) {
                    // Add event listener to future dates
                    cell.addEventListener('click', () => {
                        // Set servicePrevious highlighted to none and highlight selected element
                        serviceMonthSelectedElement.className = "month-cell";
                        cell.className = "month month-selected";
                        serviceMonthSelectedElement = cell;
                        serviceFutureWeekSelectedId = undefined;
                        showServiceWeekCalendar(current_date.getDay(), current_date.getDate(), current_date.getMonth(), current_date.getFullYear());
                    });
                }
                date++;
            }
        }
        tbl.appendChild(row); // appending each row into calendar body.
    }
}

// Week calendar that shows under the month and year header
function showServiceWeekCalendar(serviceDay, serviceDate, serviceMonth, serviceYear) {
    var year_disp = serviceYear;
    let daysInMonth = 32 - new Date(serviceYear, serviceMonth, 32).getDate();
    // on load initialize week calendar with serviceToday's date and the upcoming week
    let month_disp = serviceMonth + 1;
    // Calendar date
    let date_disp = serviceDate;

    let day_disp = serviceDays[serviceDay];
    // row holds week calendar elements
    let row = document.createElement("tr");

    // Create containers for left and right buttons
    let left_button = document.createElement("td");
    left_button.className = "table-button-header";
    let left_button_div = document.createElement("div");
    left_button_div.className = "table-button-container";
    let right_button_div = document.createElement("div");
    right_button_div.className = "table-button-container";

    // Create serviceNext and servicePrevious, day and week buttons for left side
    let left_week_button = document.createElement("button");
    left_week_button.className = 'btn btn-outline-info table-button';
    left_week_button.innerText = "<<";
    let left_day_button = document.createElement("button");
    left_day_button.className = 'btn btn-outline-info table-button';
    left_day_button.innerText = "<";
    left_button_div.appendChild(left_week_button);
    left_button_div.appendChild(left_day_button);
    left_button.appendChild(left_button_div);

    // Create serviceNext and servicePrevious, day and week buttons for right side
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
    th.id = String(serviceDate).concat("-", String(serviceMonth), "-", String(year_disp), "-service");;
    if (serviceFutureWeekSelectedId == undefined) {
        th.className = "week-cell week-selected";
        serviceWeekSelectedElement = th;
        setServiceSelectedDates(serviceDay, serviceDate, serviceMonth, serviceYear);
    } else {
        th.className = "week-cell";
    }


    th.addEventListener('click', () => {
        serviceWeekSelectedElement.className = "week-cell";
        th.className = "week-cell week-selected";
        serviceWeekSelectedElement = th;
        let date_elements = serviceWeekSelectedElement.id.split("-");
        let selected_month = parseInt(date_elements[1]);
        let selected_year = parseInt(date_elements[2]);
        if (selected_month != serviceSelectMonth.value || selected_year != serviceSelectYear.value) {
            serviceSelectMonth.value = selected_month;
            serviceSelectYear.value = selected_year;
            serviceJump();
        }
        let month_element = document.getElementById(serviceWeekSelectedElement.id.concat("-month"));
        serviceMonthSelectedElement.className = "month-cell";
        month_element.className = "month-cell month-selected";
        serviceMonthSelectedElement = month_element;
        serviceFutureWeekSelectedId = undefined;
        setServiceSelectedDates(serviceDay, serviceDate, serviceMonth, serviceYear);
    });

    row.appendChild(th);

    // Refers to day of the week
    let day_index = serviceDay;
    if (day_index == 6) {
        day_index = 0;
    } else {
        day_index++;
    }
    date_disp++;

    // Create row calendar for the rest of the week 
    let out_of_bounds = false;
    while (day_index != serviceDay) {
        day_count++;
        let td = document.createElement("td");
        if (date_disp > daysInMonth) {
            date_disp = 1;
            month_disp = month_disp + 1;
            if (month_disp > 12 && year_disp + 1 <= serviceLastYear) {
                month_disp = 1;
                year_disp = year_disp + 1;
            } else if (month_disp > 12 && year_disp + 1 > serviceLastYear) {
                out_of_bounds = true;
            } else {
                out_of_bounds = false;
            }
        }

        if (out_of_bounds == false) {
            td.id = String(date_disp).concat("-", String(month_disp - 1), "-", String(year_disp), "-service");
            td.className = "week-cell";
            day_disp = serviceDays[day_index];
            td.innerHTML = `<h6 class="week-date">${month_disp}/${date_disp}</h6>
                            <p class="week-day">${day_disp}</p>`;
            td.addEventListener('click', () => {
                serviceWeekSelectedElement.className = "week-cell";
                td.className = "week-cell week-selected";
                serviceWeekSelectedElement = td;
                let date_elements = serviceWeekSelectedElement.id.split("-");
                let selected_date = parseInt(date_elements[0]);
                let selected_month = parseInt(date_elements[1]);
                let selected_year = parseInt(date_elements[2]);
                if (selected_month != serviceSelectMonth.value || selected_year != serviceSelectYear.value) {
                    serviceSelectMonth.value = selected_month;
                    serviceSelectYear.value = selected_year;
                    serviceJump();
                }
                let month_element = document.getElementById(serviceWeekSelectedElement.id.concat("-month"));
                serviceMonthSelectedElement.className = "month-cell";
                month_element.className = "month-cell month-selected";
                serviceMonthSelectedElement = month_element;
                serviceFutureWeekSelectedId = undefined;
                let new_date = new Date(selected_year, selected_month, selected_date);
                setServiceSelectedDates(new_date.getDay(), selected_date, selected_month, selected_year);
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

    let week_head = document.querySelector('.service-week-head');
    // clear servicePrevious table
    week_head.innerText = "";
    week_head.appendChild(row);
    // If arrow buttons used to change week view
    if (serviceFutureWeekSelectedId != undefined) {
        updateServiceSelectedElements(serviceFutureWeekSelectedId);
    }

    row.prepend(left_button);
    row.appendChild(right_button);



    right_day_button.addEventListener('click', () => {
        let date_elements = serviceWeekSelectedElement.id.split("-");
        let selected_date = parseInt(date_elements[0]);
        let selected_month = parseInt(date_elements[1]);
        let selected_year = parseInt(date_elements[2]);
        let month_days = 32 - new Date(selected_year, selected_month, 32).getDate();
        let date_string = String(selected_date).concat("-", String(selected_month), "-", String(selected_year), "-service");
        // Not the last day of the calendar
        if (selected_date == 31 && selected_month == 11 && selected_year == serviceLastYear) {
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
                serviceSelectMonth.value = selected_month;
                serviceSelectYear.value = selected_year;
                serviceJump();
            }
            let start_day = serviceDay + 1;
            if (start_day > 6) {
                start_day = 0;
            }
            let start_date = serviceDate + 1;
            let start_month = serviceMonth;
            let start_year = serviceYear;
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
            date_string = String(selected_date).concat("-", String(selected_month), "-", String(selected_year), "-service");
            let new_serviceWeekSelectedElement = document.getElementById(date_string);
            // check if date exists in week calendar, update week calendar
            if (new_serviceWeekSelectedElement == null) {
                serviceFutureWeekSelectedId = date_string;
                let current_date = new Date(selected_year, selected_month, selected_date);
                showServiceWeekCalendar(start_day, start_date, start_month, start_year);
            } else {
                updateServiceSelectedElements(date_string);
            }
        }
    });

    right_week_button.addEventListener('click', () => {
        let date_elements = serviceWeekSelectedElement.id.split("-");
        let selected_date = parseInt(date_elements[0]);
        let selected_month = parseInt(date_elements[1]);
        let selected_year = parseInt(date_elements[2]);
        let month_days = 32 - new Date(selected_year, selected_month, 32).getDate();
        // Not the last day of the calendar
        if (selected_date >= 25 && selected_month == 11 && selected_year == serviceLastYear) {
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
                serviceSelectMonth.value = selected_month;
                serviceSelectYear.value = selected_year;
                serviceJump();
            }
            let start_date = serviceDate + 7;
            let start_month = serviceMonth;
            let start_year = serviceYear;
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

            date_string = String(selected_date).concat("-", String(selected_month), "-", String(selected_year), "-service");
            let new_serviceWeekSelectedElement = document.getElementById(date_string);
            // check if date exists in week calendar, update week calendar
            if (new_serviceWeekSelectedElement == null) {
                serviceFutureWeekSelectedId = date_string;
                let current_date = new Date(selected_year, selected_month, selected_date);
                showServiceWeekCalendar(serviceDay, start_date, start_month, start_year);
            } else {
                updateServiceSelectedElements(date_string);
            }
        }
    });

    left_day_button.addEventListener('click', () => {
        let date_elements = serviceWeekSelectedElement.id.split("-");
        let selected_date = parseInt(date_elements[0]);
        let selected_month = parseInt(date_elements[1]);
        let selected_year = parseInt(date_elements[2]);
        let month_days = 32 - new Date(serviceYear, serviceMonth, 32).getDate();
        // Not serviceToday
        if (selected_date == serviceToday.getDate() && selected_month == serviceToday.getMonth() && selected_year == serviceToday.getFullYear()) {
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
                serviceSelectMonth.value = selected_month;
                serviceSelectYear.value = selected_year;
                serviceJump();
                selected_date = 32 - new Date(selected_year, selected_month, 32).getDate();

            }
            date_string = String(selected_date).concat("-", String(selected_month), "-", String(selected_year), "-service");
            let new_serviceWeekSelectedElement = document.getElementById(date_string);
            // check if date exists in week calendar, update week calendar
            if (new_serviceWeekSelectedElement == null) {
                serviceFutureWeekSelectedId = date_string;
                let current_date = new Date(selected_year, selected_month, selected_date);
                showServiceWeekCalendar(current_date.getDay(), current_date.getDate(), current_date.getMonth(), current_date.getFullYear());
            } else {
                updateServiceSelectedElements(date_string);
            }
        }
    });

    left_week_button.addEventListener('click', () => {
        let date_elements = serviceWeekSelectedElement.id.split("-");
        let selected_date = parseInt(date_elements[0]);
        let start_date = serviceDate;
        let selected_month = parseInt(date_elements[1]);
        let start_month = serviceMonth;
        let selected_year = parseInt(date_elements[2]);
        let start_year = serviceYear;
        let month_days = 32 - new Date(serviceYear, serviceMonth, 32).getDate();
        selected_date = selected_date - 7;
        if (selected_date < 1) {
            if (selected_month == 0) {
                selected_month = 11;
                selected_year--;
            } else {
                selected_month--;
            }
            serviceSelectMonth.value = selected_month;
            serviceSelectYear.value = selected_year;
            serviceJump();
            selected_date = (32 - new Date(selected_year, selected_month, 32).getDate()) + selected_date;
        }
        let new_selected = new Date(selected_year, selected_month, selected_date);

        if (new_selected.getTime() > serviceToday.getTime() || (serviceToday.getDate() == new_selected.getDate() && serviceToday.getMonth() == new_selected.getMonth() && serviceToday.getFullYear() == new_selected.getFullYear())) {
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
            if (serviceToday.getTime() >= new_start.getTime() || (serviceToday.getDate() == new_start.getDate() && serviceToday.getMonth() == new_start.getMonth() && serviceToday.getFullYear() == new_start.getFullYear())) {
                new_start = serviceToday;
                start_date = serviceToday.getDate();
                start_month = serviceToday.getMonth();
                start_year = serviceToday.getFullYear();
            }
            date_string = String(selected_date).concat("-", String(selected_month), "-", String(selected_year), "-service");
            let new_serviceWeekSelectedElement = document.getElementById(date_string);
            // check if date exists in week calendar, update week calendar
            if (new_serviceWeekSelectedElement == null) {
                serviceFutureWeekSelectedId = date_string;
                let current_date = new Date(selected_year, selected_month, selected_date);
                showServiceWeekCalendar(serviceDay, start_date, start_month, start_year);
            } else {
                updateServiceSelectedElements(date_string);
            }
        }
    });
}

// update elements in week and month calendar without changing the week or month calendar view
function updateServiceSelectedElements(service_date_string) {
    let new_serviceWeekSelectedElement = document.getElementById(service_date_string);
    let new_serviceMonthSelectedElement = document.getElementById(service_date_string.concat("-month"));
    let date_elements = service_date_string.split("-");
    let selected_date = parseInt(date_elements[0]);
    let selected_month = parseInt(date_elements[1]);
    let selected_year = parseInt(date_elements[2]);
    if (new_serviceMonthSelectedElement == null) {
        serviceSelectMonth.value = selected_month;
        serviceSelectYear.value = selected_year;
        serviceJump();
        new_serviceMonthSelectedElement = document.getElementById(service_date_string.concat("-month"));
    }
    let new_date = new Date(selected_year, selected_month, selected_date);
    setServiceSelectedDates(new_date.getDay(), new_date.getDate(), new_date.getMonth(), new_date.getFullYear());
    serviceWeekSelectedElement.className = "week-cell";
    serviceMonthSelectedElement.className = "month-cell";
    new_serviceWeekSelectedElement.className = "week-cell week-selected";
    new_serviceMonthSelectedElement.className = "month-cell month-selected"
    serviceWeekSelectedElement = new_serviceWeekSelectedElement;
    serviceMonthSelectedElement = new_serviceMonthSelectedElement;
    serviceFutureWeekSelectedId = undefined;
}

function setServiceSelectedDates(serviceDay, serviceDate, serviceMonth, serviceYear) {
    serviceSelectedDay = serviceDay;
    serviceSelectedDate = serviceDate;
    serviceSelectedMonth = serviceMonth;
    serviceSelectedYear = serviceYear;
    // On new selected serviceDays load appointments for that day
    loadServiceBookings()
}


function loadServiceBookings() {
    let client_id = document.getElementById("id").value;
    let client = "False";
    fetch(`/get_day_bookings/${client_id}/${serviceSelectedDay}/${serviceSelectedDate}/${serviceSelectedMonth}/${serviceSelectedYear}/${client}`)
        .then(response => response.json())
        .then(result => {
            let times = result.times;
            let am_pm = result.am_pm;
            let services = result.services;
            let listings = result.listings;
            let clients = result.clients;
            let service_appointment_body = document.getElementById('service-appointment-body');
            service_appointment_body.innerHTML = "";
            let header = document.createElement('h6');
            if (times.length == 0) {
                header.innerText = "No Appointments";
                service_appointment_body.appendChild(header);
            } else {
                header.innerText = "Appointments";
                service_appointment_body.appendChild(header);

                let appointment_row = document.createElement('div');
                appointment_row.className = "row appointments";
                service_appointment_body.appendChild(appointment_row);

                let right_div = document.createElement('div');
                right_div.className = 'col right-div';
                let right_p = document.createElement('p');
                right_p.className = "centered-paragraph";
                right_p.innerHTML = `<u>AM</u>`;
                let right_appointment_div = document.createElement('div');
                right_appointment_div.className = "appointment-div";
                right_appointment_div.id = "service-appointment-am";
                right_div.appendChild(right_p);
                right_div.appendChild(right_appointment_div);
                appointment_row.appendChild(right_div);

                let left_div = document.createElement('div');
                left_div.className = 'col left-div';
                let left_p = document.createElement('p');
                left_p.className = "centered-paragraph";
                left_p.innerHTML = `<u>PM</u>`;
                let left_appointment_div = document.createElement('div');
                left_appointment_div.className = "appointment-div appointment-pm";
                left_appointment_div.id = "service-appointment-pm";
                left_div.appendChild(left_p);
                left_div.appendChild(left_appointment_div);
                appointment_row.appendChild(left_div);

                for (let i = 0; i < times.length; i++) {
                    let button = document.createElement('input');
                    button.type = "button";
                    if (am_pm[i] == 'AM') {
                        button.className = "btn btn-primary btn-sm appointment-button";
                        button.value = times[i] + " - " + clients[i];
                        right_appointment_div.appendChild(button);
                    } else {
                        button.className = "btn btn-primary btn-sm appointment-button";
                        button.value = times[i] + " - " + clients[i];
                        left_appointment_div.appendChild(button);
                    }
                    // let url = window.location.origin;
                    // Link to listing
                    // button.href = url +"/listing" + "/" + listings[i];
                }
            }
        });
}
