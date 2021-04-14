let userToday = new Date();
let userCurrentDay = userToday.getDay();
let userCurrentDate = userToday.getDate();
let userCurrentMonth = userToday.getMonth();
let userCurrentYear = userToday.getFullYear();
let userSelectYear = document.getElementById("user-year");
let userSelectMonth = document.getElementById("user-month");

let userMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let userDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// start of week calendar
var userStartDay;
var userStartDate;
var userStartMonth;
var userLastYear;
// day highlighted
var userMonthSelectedElement;
var userWeekSelectedElement;
var userFutureWeekSelectedId;

var userSelectedDay;
var userSelectedDate;
var userSelectedMonth;
var userSelectedYear;

document.addEventListener("DOMContentLoaded", function () {
    setUserCalendarMonth();
    setUserCalendarYear();
    setUserCalendar(userCurrentMonth, userCurrentYear);
    showUserWeekCalendar(userCurrentDay, userCurrentDate, userCurrentMonth, userCurrentYear);

});

function setUserCalendarMonth() {
    let month = document.getElementById('user-month');
    month.style.cursor = "pointer";
    for (let i = 0; i <= 11; i++) {
        let option = document.createElement('option');
        option.value = i;
        option.innerText = userMonths[i];
        month.appendChild(option);
    }

    month.addEventListener("click", (event) => {
        event.stopPropagation();
    })
}

function setUserCalendarYear() {
    let year = document.getElementById('user-year');
    year.style.cursor = "pointer";
    for (let i = userCurrentYear; i <= userCurrentYear + 3; i++) {
        let option = document.createElement('option');
        option.value = i;
        option.innerText = i;
        year.appendChild(option);
        userLastYear = i;
    }

    year.addEventListener("click", (event) => {
        event.stopPropagation();
    })
}


function userNext() {
    userCurrentYear = (userCurrentMonth === 11) ? userCurrentYear + 1 : userCurrentYear;
    userCurrentMonth = (userCurrentMonth + 1) % 12;
    setUserCalendar(userCurrentMonth, userCurrentYear);
}

function userPrevious() {
    userCurrentYear = (userCurrentMonth === 0) ? userCurrentYear - 1 : userCurrentYear;
    userCurrentMonth = (userCurrentMonth === 0) ? 11 : userCurrentMonth - 1;
    setUserCalendar(userCurrentMonth, userCurrentYear);
}

function userJump() {
    userCurrentYear = parseInt(userSelectYear.value);
    userCurrentMonth = parseInt(userSelectMonth.value);
    setUserCalendar(userCurrentMonth, userCurrentYear);
}

// Collapsable calendar under the month and year header
function setUserCalendar(month, year) {
    // make whole header clickable
    let headingTwo = document.getElementById('headingTwo');
    headingTwo.style.cursor = "pointer";
    let user_month_year = document.getElementById("user-month-year");
    headingTwo.addEventListener('click', () => {
        user_month_year.click();
    });

    document.getElementById('user-previous-button').addEventListener('click', (event) => {
        event.stopPropagation();
    });

    document.getElementById('user-next-button').addEventListener('click', (event) => {
        event.stopPropagation();
    });

    let firstDay = (new Date(year, month)).getDay();
    let daysInMonth = 32 - new Date(year, month, 32).getDate();

    let tbl = document.getElementById("user-calendar-body"); // body of the calendar

    // clearing all userPrevious cells
    tbl.innerHTML = "";

    // filing data about month and in the page via DOM.
    user_month_year.innerHTML = userMonths[month] + " " + year;
    userSelectYear.value = year;
    userSelectMonth.value = month;

    // creating all cells
    let date = 1;
    for (let i = 0; i < 6; i++) {
        // creates a table row
        let row = document.createElement("tr");

        //creating individual cells, filing them up with data.
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay || userSelectYear.value == "" || userSelectMonth == "") {
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
                // color userToday's date
                if (date === userToday.getDate() && year === userToday.getFullYear() && month === userToday.getMonth()) {
                    cell.className = "month-cell month-selected";
                    userMonthSelectedElement = cell
                    // Add event listener to userToday's date
                    cell.addEventListener('click', () => {
                        // Set userPrevious highlighted to none and highlight selected element
                        userMonthSelectedElement.className = "month-cell";
                        cell.className = "month-cell month-selected";
                        userMonthSelectedElement = cell;
                        userFutureWeekSelectedId = undefined;
                        showUserWeekCalendar(userToday.getDay(), userToday.getDate(), userToday.getMonth(), userToday.getFullYear());
                    });
                } 
                row.appendChild(cell);
                
                let current_date = new Date(year, month, date);
                if (userToday.getTime() <= current_date.getTime()) {
                    // Add event listener to future dates
                    cell.addEventListener('click', () => {
                        // Set userPrevious highlighted to none and highlight selected element
                        userMonthSelectedElement.className = "month-cell";
                        cell.className = "month month-selected";
                        userMonthSelectedElement = cell;
                        userFutureWeekSelectedId = undefined;
                        showUserWeekCalendar(current_date.getDay(), current_date.getDate(), current_date.getMonth(), current_date.getFullYear());
                    });
                }   
                date++;
            }
        }
        tbl.appendChild(row); // appending each row into calendar body.
    }
}

// Week calendar that shows under the month and year header
function showUserWeekCalendar(day, date, month, year) {
    var year_disp = year;
    console.log(year);
    let daysInMonth = 32 - new Date(year, month, 32).getDate();
    // on load initialize week calendar with userToday's date and the upcoming week
    let month_disp = month + 1;
    // Calendar date
    let date_disp = date;

    let day_disp = userDays[day];
    // row holds week calendar elements
    let row = document.createElement("tr");
    
    // Create containers for left and right buttons
    let left_button = document.createElement("td");
    left_button.className = "table-button-header";
    let left_button_div = document.createElement("div");
    left_button_div.className = "table-button-container";
    let right_button_div = document.createElement("div");
    right_button_div.className = "table-button-container";
    
    // Create userNext and userPrevious, day and week buttons for left side
    let left_week_button = document.createElement("button");
    left_week_button.className = 'btn btn-outline-info table-button';
    left_week_button.innerText = "<<";
    let left_day_button = document.createElement("button");
    left_day_button.className = 'btn btn-outline-info table-button';
    left_day_button.innerText = "<";
    left_button_div.appendChild(left_week_button);
    left_button_div.appendChild(left_day_button);
    left_button.appendChild(left_button_div);
    
    // Create userNext and userPrevious, day and week buttons for right side
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
    if (userFutureWeekSelectedId == undefined) {
        th.className = "week-cell week-selected";
        userWeekSelectedElement = th; 
        setUserSelectedDates(day, date, month, year);
    } else {
        th.className = "week-cell";
    }
    
    
    th.addEventListener('click', () => {
        userWeekSelectedElement.className = "week-cell";
        th.className = "week-cell week-selected";
        userWeekSelectedElement = th;
        let date_elements = userWeekSelectedElement.id.split("-");
        let selected_month = parseInt(date_elements[1]);
        let selected_year = parseInt(date_elements[2]);
        if (selected_month != userSelectMonth.value || selected_year != userSelectYear.value) {
            userSelectMonth.value = selected_month;
            userSelectYear.value = selected_year;
            userJump();
        }
        let month_element = document.getElementById(userWeekSelectedElement.id.concat("-month"));
        userMonthSelectedElement.className = "month-cell";
        month_element.className = "month-cell month-selected";
        userMonthSelectedElement = month_element;
        userFutureWeekSelectedId = undefined;
        setUserSelectedDates(day, date, month, year);
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
        console.log(day_index);
        day_count++;
        let td = document.createElement("td");
        if (date_disp > daysInMonth) {
            date_disp = 1;
            month_disp = month_disp + 1;
            if (month_disp > 12 && year_disp + 1 <= userLastYear) {
                month_disp = 1;
                year_disp = year_disp + 1;
            } else if (month_disp > 12 && year_disp + 1 > userLastYear) {
                out_of_bounds = true;
            } else {
                out_of_bounds = false;
            }
        }

        if (out_of_bounds == false) {
            td.id = String(date_disp).concat("-", String(month_disp - 1), "-", String(year_disp));
            td.className = "week-cell";
            day_disp = userDays[day_index];
            td.innerHTML = `<h6 class="week-date">${month_disp}/${date_disp}</h6>
                            <p class="week-day">${day_disp}</p>`;
            td.addEventListener('click', () => {
                userWeekSelectedElement.className = "week-cell";
                td.className = "week-cell week-selected";
                userWeekSelectedElement = td;  
                let date_elements = userWeekSelectedElement.id.split("-");
                let selected_date = parseInt(date_elements[0]);
                let selected_month = parseInt(date_elements[1]);
                let selected_year = parseInt(date_elements[2]);
                if (selected_month != userSelectMonth.value || selected_year != userSelectYear.value) {
                    userSelectMonth.value = selected_month;
                    userSelectYear.value = selected_year;
                    userJump();
                }
                let month_element = document.getElementById(userWeekSelectedElement.id.concat("-month"));
                userMonthSelectedElement.className = "month-cell";
                month_element.className = "month-cell month-selected";
                userMonthSelectedElement = month_element;
                userFutureWeekSelectedId = undefined;
                let new_date = new Date(selected_year, selected_month, selected_date);
                setUserSelectedDates(new_date.getDay(), selected_date, selected_month, selected_year);
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
    
    let week_head = document.querySelector('.user-week-head');
    // clear userPrevious table
    week_head.innerText = "";
    week_head.appendChild(row);
    // If arrow buttons used to change week view
    if (userFutureWeekSelectedId != undefined) {
        updateUserSelectedDates(userFutureWeekSelectedId);
    }
        
    row.prepend(left_button);
    row.appendChild(right_button);
    
    

    right_day_button.addEventListener('click', () => {
        let date_elements = userWeekSelectedElement.id.split("-");
        let selected_date = parseInt(date_elements[0]);
        let selected_month = parseInt(date_elements[1]);
        let selected_year = parseInt(date_elements[2]);
        let month_days = 32 - new Date(selected_year, selected_month, 32).getDate();
        let date_string = String(selected_date).concat("-", String(selected_month), "-", String(selected_year));
        // Not the last day of the calendar
        if (selected_date == 31 && selected_month == 11 && selected_year == userLastYear) {
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
                userSelectMonth.value = selected_month;
                userSelectYear.value = selected_year;
                userJump();
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
            let new_userWeekSelectedElement = document.getElementById(date_string);
            // check if date exists in week calendar, update week calendar
            if (new_userWeekSelectedElement == null) {
                userFutureWeekSelectedId = date_string;
                let current_date = new Date(selected_year, selected_month, selected_date);
                showUserWeekCalendar(start_day, start_date, start_month, start_year);
            } else {
                updateUserSelectedDates(date_string);
            }
        }
    });

    right_week_button.addEventListener('click', () => {
        let date_elements = userWeekSelectedElement.id.split("-");
        let selected_date = parseInt(date_elements[0]);
        let selected_month = parseInt(date_elements[1]);
        let selected_year = parseInt(date_elements[2]);
        let month_days = 32 - new Date(selected_year, selected_month, 32).getDate();
        // Not the last day of the calendar
        if (selected_date >= 25 && selected_month == 11 && selected_year == userLastYear) {
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
                userSelectMonth.value = selected_month;
                userSelectYear.value = selected_year;
                userJump();
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
            let new_userWeekSelectedElement = document.getElementById(date_string);
            // check if date exists in week calendar, update week calendar
            if (new_userWeekSelectedElement == null) {
                userFutureWeekSelectedId = date_string;
                let current_date = new Date(selected_year, selected_month, selected_date);
                showUserWeekCalendar(day, start_date, start_month, start_year);
            } else {
                updateUserSelectedDates(date_string);
            }
        }
    });
    
    left_day_button.addEventListener('click', () => {
        let date_elements = userWeekSelectedElement.id.split("-");
        let selected_date = parseInt(date_elements[0]);
        let selected_month = parseInt(date_elements[1]);
        let selected_year = parseInt(date_elements[2]);
        let month_days = 32 - new Date(year, month, 32).getDate();
        // Not userToday
        if (selected_date == userToday.getDate() && selected_month == userToday.getMonth() && selected_year == userToday.getFullYear()) {
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
                userSelectMonth.value = selected_month;
                userSelectYear.value = selected_year;
                userJump();
                selected_date = 32 - new Date(selected_year, selected_month, 32).getDate();
                
            }
            date_string = String(selected_date).concat("-", String(selected_month), "-", String(selected_year));
            let new_userWeekSelectedElement = document.getElementById(date_string);
            // check if date exists in week calendar, update week calendar
            if (new_userWeekSelectedElement == null) {
                userFutureWeekSelectedId = date_string;
                let current_date = new Date(selected_year, selected_month, selected_date);
                showUserWeekCalendar(current_date.getDay(), current_date.getDate(), current_date.getMonth(), current_date.getFullYear());
            } else {
                updateUserSelectedDates(date_string);
            }
        }
    });

    left_week_button.addEventListener('click', () => {
        let date_elements = userWeekSelectedElement.id.split("-");
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
            userSelectMonth.value = selected_month;
            userSelectYear.value = selected_year;
            userJump();
            selected_date = (32 - new Date(selected_year, selected_month, 32).getDate()) + selected_date;
        }
        let new_selected = new Date(selected_year, selected_month, selected_date);

        if (new_selected.getTime() > userToday.getTime() || (userToday.getDate() == new_selected.getDate() && userToday.getMonth() == new_selected.getMonth() && userToday.getFullYear() == new_selected.getFullYear())) {
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
            if (userToday.getTime() >= new_start.getTime() || (userToday.getDate() == new_start.getDate() && userToday.getMonth() == new_start.getMonth() && userToday.getFullYear() == new_start.getFullYear())) {
                new_start = userToday;
                start_date = userToday.getDate();
                start_month = userToday.getMonth();
                start_year = userToday.getFullYear();
            }
            date_string = String(selected_date).concat("-", String(selected_month), "-", String(selected_year));
            let new_userWeekSelectedElement = document.getElementById(date_string);
            // check if date exists in week calendar, update week calendar
            if (new_userWeekSelectedElement == null) {
                userFutureWeekSelectedId = date_string;
                let current_date = new Date(selected_year, selected_month, selected_date);
                showUserWeekCalendar(day, start_date, start_month, start_year);
            } else {
                updateUserSelectedDates(date_string);
            }
        }
    }); 
}

// update elements in week and month calendar without changing the week or month calendar view
function updateUserSelectedDates(date_string) {
    let new_userWeekSelectedElement = document.getElementById(date_string);
    let new_userMonthSelectedElement = document.getElementById(date_string.concat("-month"));
    let date_elements = date_string.split("-");
    let selected_date = parseInt(date_elements[0]);
    let selected_month = parseInt(date_elements[1]);
    let selected_year = parseInt(date_elements[2]);
    if (new_userMonthSelectedElement == null) {
        userSelectMonth.value = selected_month;
        userSelectYear.value = selected_year;
        userJump();
        new_userMonthSelectedElement = document.getElementById(date_string.concat("-month"));
    }
    let new_date = new Date(selected_year, selected_month, selected_date);
    setUserSelectedDates(new_date.getDay(), new_date.getDate(), new_date.getMonth(), new_date.getFullYear());
    userWeekSelectedElement.className = "week-cell";
    userMonthSelectedElement.className = "month-cell";
    new_userWeekSelectedElement.className = "week-cell week-selected";
    new_userMonthSelectedElement.className = "month-cell month-selected"
    userWeekSelectedElement = new_userWeekSelectedElement;
    userMonthSelectedElement = new_userMonthSelectedElement;
    userFutureWeekSelectedId = undefined;
}

function setUserSelectedDates(day, date, month, year) {
    userSelectedDay = day;
    userSelectedDate = date;
    userSelectedMonth = month;
    userSelectedYear = year;
    // On new selected userDays load appointments for that day
    loadUserBookings()
}


function loadUserBookings() {
    let client_name = document.getElementById("username").value;
    let client = "True";
    fetch(`/get_day_bookings/${client_name}/${userSelectedDay}/${userSelectedDate}/${userSelectedMonth}/${userSelectedYear}/${client}`)
    .then(response => response.json())
    .then(result => {
        let times = result.times;
        let am_pm = result.am_pm;
        let services = result.services;
        let listing_ids = result.listing_ids;
        let listing_titles = result.listing_titles;
        let user_appointment_body = document.getElementById('user-appointment-body');
        user_appointment_body.innerHTML = "";
        let header = document.createElement('h6');
        if (times.length == 0) {
            header.innerText = "No Appointments";
            user_appointment_body.appendChild(header);
        } else {
            header.innerText = "Appointments:";
            user_appointment_body.appendChild(header);

            let appointment_row = document.createElement('div');
            appointment_row.className = "row appointments";
            user_appointment_body.appendChild(appointment_row);

            let right_div = document.createElement('div');
            right_div.className = 'col right-div';
            appointment_row.appendChild(right_div);

            let right_p = document.createElement('p');
            right_p.className = "centered-paragraph";
            right_p.innerHTML = `<u>AM</u>`;
            right_div.appendChild(right_p);

            let right_appointment_div = document.createElement('div');
            right_appointment_div.className = "appointment-div";
            right_appointment_div.id = "user-appointment-am";
            right_div.appendChild(right_appointment_div);

            let left_div = document.createElement('div');
            left_div.className = 'col left-div';
            appointment_row.appendChild(left_div);

            let left_p = document.createElement('p');
            left_p.className = "centered-paragraph";
            left_p.innerHTML = `<u>PM</u>`;
            left_div.appendChild(left_p);
            
            let left_appointment_div = document.createElement('div');
            left_appointment_div.className = "appointment-div appointment-pm";
            left_appointment_div.id = "user-appointment-pm";
            left_div.appendChild(left_appointment_div);
            
            for (let i=0; i < times.length; i++) {
                let button = document.createElement('button');
                if (am_pm[i] == 'AM') {
                    button.className = "btn btn-primary btn-sm appointment-button";
                    button.innerText = times[i] + " - " + services[i];
                    right_appointment_div.appendChild(button);
                } else {
                    button.className = "btn btn-primary btn-sm appointment-button";
                    button.innerText = times[i] + " - " + services[i];
                    left_appointment_div.appendChild(button);
                }
                button.addEventListener('click', () => {
                    let url = window.location.origin;
                    // Link to listing
                    document.location.href = url + "/listing" + "/" + listing_titles[i] + "/" + listing_ids[i];
                });
                
            }
        }
    });
}
