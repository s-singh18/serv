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

document.addEventListener("DOMContentLoaded", function () {
    setMonth();
    setYear();
    showCalendar(currentMonth, currentYear);
    showWeekCalendar(currentDay, currentDate, currentMonth, currentYear);

});

function setMonth() {
    let services_header = document.getElementById('services-header');
    services_header.style.cursor = "pointer";
    services_header.addEventListener('click', () => {
        document.getElementById('services-button').click();
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

function setYear() {
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
    tbl.innerHTML = "";

    // filing data about month and in the page via DOM.
    monthAndYear.innerHTML = months[month] + " " + year;
    selectYear.value = year;
    selectMonth.value = month;

    // creating all cells
    let date = 1;
    for (let i = 0; i < 6; i++) {
        // creates a table row
        let row = document.createElement("tr");

        //creating individual cells, filing them up with data.
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay) {
                let cell = document.createElement("td");
                let cellText = document.createTextNode("");
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
    console.log(year);
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
    left_week_button.innerHTML = "<<";
    let left_day_button = document.createElement("button");
    left_day_button.className = 'btn btn-outline-info table-button';
    left_day_button.innerHTML = "<";
    left_button_div.appendChild(left_week_button);
    left_button_div.appendChild(left_day_button);
    left_button.appendChild(left_button_div);
    
    // Create next and previous, day and week buttons for right side
    let right_button = document.createElement("td");
    right_button.className = "table-button-header";
    let right_day_button = document.createElement("button");
    right_day_button.className = 'btn btn-outline-info table-button';
    right_day_button.innerHTML = ">";
    let right_week_button = document.createElement("button");
    right_week_button.className = 'btn btn-outline-info table-button';
    right_week_button.innerHTML = ">>";
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
    week_head.innerHTML = "";
    week_head.appendChild(row);
    // If arrow buttons used to change week view
    if (future_week_selected_id != undefined) {
        updateSelectedElements(future_week_selected_id);
        // week_selected_element.className = "week-cell";
        // month_selected_element.className = "month-cell";
        // week_selected_element = document.getElementById(future_week_selected_id);
        // month_selected_element = document.getElementById(future_week_selected_id.concat("-month"));
        // month_selected_element.className = "month-cell month-selected";
        // week_selected_element.className = "week-cell week-selected";
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
    if (new_month_selected_element == null) {
        let date_elements = date_string.split("-");
        let selected_date = parseInt(date_elements[0]);
        let selected_month = parseInt(date_elements[1]);
        let selected_year = parseInt(date_elements[2]);
        selectMonth.value = selected_month;
        selectYear.value = selected_year;
        jump();
        new_month_selected_element = document.getElementById(date_string.concat("-month"));
    }
    week_selected_element.className = "week-cell";
    month_selected_element.className = "month-cell";
    new_week_selected_element.className = "week-cell week-selected";
    new_month_selected_element.className = "month-cell month-selected"
    week_selected_element = new_week_selected_element;
    month_selected_element = new_month_selected_element;
    future_week_selected_id = undefined;
}