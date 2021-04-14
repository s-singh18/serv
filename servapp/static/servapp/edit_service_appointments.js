var serviceCount;
var activeLink;
var prevNewItem;
var cardBlock;
var tabContent;
var activeTab;
var activePanel;
var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var amDicts = [];
var pmDicts = [];
var checkedDays = [];
var originalIDs = [];
// Used to access dicts and days list
var activeTab;
var activePanel
var activeIndex;
var originalListingTitle;

document.addEventListener("DOMContentLoaded", function () {
    serviceCount = 0;
    activeIndex = 0;
    originalListingTitle = document.getElementById('title').value;
    loadServices();
    submitListing();
    
});

class ListingError extends Error {
    constructor(message, errors) {
      super(message, errors); // (1)
      this.errors = errors;
      this.name = "ListingError"; // (2)
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


var tabNav = document.getElementById('tab-nav')
var paneContent = document.getElementById('pane-content');

function loadServices() {
    let username = document.getElementById('username').value;
    fetch(`/get-services/${originalListingTitle}/${username}`)
    .then(response => response.json())
    .then(result => { 
        let service_name;
        let service_rate;
        let service_times;
        let services = JSON.parse(result);
        if (services.length != 0) {
            let count = 0;
            services.forEach(service => {
                let current_count = String(serviceCount);
                let nav_item = document.createElement('li');
                nav_item.className = "nav-item";
                
                // Create link for service
                let nav_link = document.createElement('div');
                nav_link.id = "tab-".concat(current_count);
                // nav_link.setAttribute("type", "button");
                nav_link.setAttribute("role", "tab");
                nav_link.setAttribute("aria-controls", "service-".concat(current_count));
                if (serviceCount == 0) {
                    nav_link.className = "nav-link active service-tab";
                    nav_link.setAttribute("aria-selected", "true");
                } else {
                    nav_link.className = "nav-link service-tab";
                    nav_link.setAttribute("aria-selected", "false");
                }
                
                // For innerText
                let nav_text = document.createElement("span");
                nav_text.innerText = service.fields.name;
    
                nav_link.appendChild(nav_text);
                nav_item.appendChild(nav_link);
                tabNav.appendChild(nav_item);

                // Append id 
                let service_id = document.createElement("input");
                service_id.className = "service-id";
                service_id.type = "hidden";
                service_id.value = service.pk;
                originalIDs.push(service.pk);
                nav_item.appendChild(service_id);
    
                //  Add panel content
                let tab_pane = document.createElement("div");
                tab_pane.id = "service-".concat(current_count);
                tab_pane.setAttribute("role", "tabpanel");
                if (serviceCount == 0) {
                    tab_pane.className = "tab-pane active";
                } else {
                    tab_pane.className = "tab-pane";
                    tab_pane.setAttribute("aria-labelledby", "service-".concat(current_count), "-tab");
                }
                paneContent.appendChild(tab_pane);

    
                // Beginning of service appointment form
    
                let service_form = document.createElement("div");
                service_form.className = "service-form";
                tab_pane.appendChild(service_form)
    
                let name_rate_row = document.createElement("div");
                name_rate_row.className = "row service-row";
                service_form.appendChild(name_rate_row)
    
                // Set service name input
                let service_name = document.createElement("input");
                service_name.className = "form-control service-name";
                service_name.id = "service-name-".concat(current_count)
                service_name.placeholder = "Name";
                service_name.value = service.fields.name;
                service_name.focus();
                name_rate_row.appendChild(service_name);
                // Change tab to service name
                service_name.addEventListener('keyup', (event) => {
                    event.stopPropagation();
                    nav_text.innerText = service_name.value;
                });
    
                let service_rate = document.createElement("input")
                service_rate.className = "form-control service-rate";
                service_rate.placeholder = "Rate";
                service_rate.type = "number";
                service_rate.value = service.fields.rate;
                name_rate_row.appendChild(service_rate);
                
                let time_row = document.createElement("div");
                time_row.className = "row service-row time-row";
                service_form.appendChild(time_row);
    
                let time_label = document.createElement("h5");
                time_label.innerText = "Time:";
                time_label.className = "time";
                time_row.appendChild(time_label);
    
                let hours = document.createElement('select');
                hours.className = "hours"
                time_row.appendChild(hours);
    
                for (let i = 0; i < 12; i++) {
                    let hour = document.createElement('option');
                    if (i == 0) {
                        hour.value = 12;
                        hour.innerText = 12;
                    } else {
                        hour.value = i;
                        hour.innerText = i;
                    }
                    hours.appendChild(hour);
                }
    
                let colon = document.createElement("h5");
                colon.className = "colon";
                colon.innerText = ":";
                time_row.appendChild(colon);
    
                let minutes = document.createElement("select");
                minutes.className = "minutes";
                time_row.appendChild(minutes);
                for (let i=0; i < 4; i++) {
                    let minute = document.createElement("option");
                    if (i == 0) {
                        minute.value = 00;
                        minute.innerText = "00";
                    } else {
                        minute.value = i * 15;
                        minute.innerText = i * 15;
                    }
                    minutes.appendChild(minute);
                }
    
                let am_pm = document.createElement("select");
                let am = document.createElement("option");
                am.value = "AM";
                am.innerText = "AM";
                let pm = document.createElement("option");
                pm.value = "PM";
                pm.innerText = "PM";
                time_row.appendChild(am_pm);
                am_pm.appendChild(am);
                am_pm.appendChild(pm);
    
                let days_row = document.createElement('div');
                days_row.className = "row days-row"
                service_form.appendChild(days_row);
    
                let button_row = document.createElement('div');
                button_row.className = "row";
    
                let appt_button = document.createElement('input');
                appt_button.type = "button";
                appt_button.className = "btn btn-primary btn-lg btn-block appointment-button";
                appt_button.value = "Create Appointment!";
    
                let hr = document.createElement('hr');
    
                let appointment_header = document.createElement('h6');
                appointment_header.className = "appointment-header";
                appointment_header.innerText = "Appointments:";
    
                let appointments = document.createElement('div');
                appointments.className = "row appointments";
    
                let left_div = document.createElement('div');
                left_div.className = "col left-div";
    
                let left_p = document.createElement('p');
                left_p.className = "centered-paragraph";
                left_p.innerHTML = "<u>AM</u>";
    
                let appointment_am = document.createElement('div');
                appointment_am.className = "appointment-div";
                appointment_am.id = "appointment-am";
                
                let right_div = document.createElement('div');
                right_div.className = "col right-div";
    
                let right_p = document.createElement('p');
                right_p.className = "centered-paragraph";
                right_p.innerHTML = "<u>PM</u>";
    
                let appointment_pm = document.createElement('div');
                appointment_pm.className = "appointment-div";
                appointment_pm.id = "appointment-pm";
    
                service_form.appendChild(button_row);
                button_row.appendChild(appt_button);
                service_form.appendChild(hr);
                service_form.appendChild(appointment_header);
                service_form.appendChild(appointments)
                appointments.appendChild(left_div);
                left_div.appendChild(left_p);
                left_div.appendChild(appointment_am);
                appointments.appendChild(right_div);
                right_div.appendChild(right_p); 
                right_div.appendChild(appointment_pm);

                if (count == 0) {
                    activeTab = nav_link;
                    activePanel = tab_pane;
                }
    
                // Create labels and checkboxes for labels and days of the week
                let am_appts;
                let pm_appts;
                let am_appt_dict = {
                    "Sun": [],
                    "Mon": [],
                    "Tue": [],
                    "Wed": [],
                    "Thu": [],
                    "Fri": [],
                    "Sat": [],
                };
                let pm_appt_dict = {
                    "Sun": [],
                    "Mon": [],
                    "Tue": [],
                    "Wed": [],
                    "Thu": [],
                    "Fri": [],
                    "Sat": [],
                };
                let times = service.fields.times.split(";");
                for (let i = 0; i < 7; i++) {
                    let appt_times = times[i].split("-");
                    // Add am appts 
                    let am_appt_times = appt_times[0].split(",");
                    let pm_appt_times = appt_times[1].split(",");
                    am_appt_times.forEach(appt => {
                        if (appt != "") {
                            am_appt_dict[days[i]].push(appt);
                        }
                    });
                    // Add pm appts
                    pm_appt_times.forEach(appt => {
                        if (appt != "") {
                            pm_appt_dict[days[i]].push(appt);
                        }
                        
                    });
                };
                
                amDicts.push(am_appt_dict);
                pmDicts.push(pm_appt_dict);
                checkedDays.push([]);
                let day_index = 0;
                days.forEach(day => {
                    let current_index = day_index;
                    let current_day = day;
                    let label = document.createElement('label');
                    label.className = "day-label";
                    label.innerText = day;
                    let check = document.createElement('input');
                    check.className = "check";
                    check.id = day;
                    check.type = "checkbox";
                    label.appendChild(check);
                    days_row.appendChild(label);
    
                    check.addEventListener('click', (event) => {
                        event.stopPropagation();
                        // Get the appointments for the checked day
                        am_appts = amDicts[activeIndex][check.id];
                        pm_appts = pmDicts[activeIndex][check.id];
                        if (check.checked) {
                            // Add to checked days
                            checkedDays[activeIndex].push(check.id);
                            // If other days have the exact same appointment times check those too
                            for (let i = 0; i < 7; i++) {
                                // Not for current day
                                if (i != days.indexOf(check.id)) {
                                    let other_day = days[i];
                                    let other_day_am_appts = amDicts[activeIndex][other_day];
                                    let other_day_pm_appts = pmDicts[activeIndex][other_day];
    
                                    // Check same length
                                    let am_flag = 0;
                                    let pm_flag = 0;
                                    if (am_appts.length == other_day_am_appts.length && pm_appts.length == other_day_pm_appts.length) {
                                        // Loop through both arrays
                                        // Check if am appts are the same
                                        for (let j = 0; j < am_appts.length; j++) {
                                            if (other_day_am_appts[j] != am_appts[j]) {
                                                am_flag = 1;
                                            }
                                        }
                                        // Check if pm appts are the same
                                        for (let k = 0; k < pm_appts.length; k++) {
                                            if (other_day_pm_appts[k] != pm_appts[k]) {
                                                pm_flag = 1;
                                            }
                                        }  
                                    } else {
                                        am_flag = 1;
                                        pm_flag = 1;
                                    }
    
                                    // If both are the same then check the checkbox for the corresponding day and add to checked days list
                                    if (am_flag == 0 && pm_flag == 0) {
                                        if (checkedDays[activeIndex].includes(days[i]) == false) {
                                            service_form.childNodes[2].childNodes[i].firstElementChild.checked = true;
                                            checkedDays[activeIndex].push(days[i]);
                                        }  
                                    } else {
                                        if (checkedDays[activeIndex].includes(days[i])) {
                                            service_form.childNodes[2].childNodes[i].firstElementChild.checked = false;
                                            checkedDays[activeIndex] = checkedDays[activeIndex].filter(item => item != days[i]);
                                        }       
                                    }
                                }
                            }
                        //  Remove from checked days list if unchecked
                        } else if (check.checked == false) {
                            checkedDays[activeIndex] = checkedDays[activeIndex].filter(item => item != check.id);
                            if (checkedDays[activeIndex].length == 0) {
                                am_appts = [];
                                pm_appts = [];
                            }
                        }
    
                        appointment_am.innerHTML = '';
                        appointment_pm.innerHTML = '';
    
                        if (am_appts.length > 0) {
                            am_appts.forEach(appt => {
                            
                                let button = document.createElement('input');
                                button.type = "button";
                                button.className = "btn btn-primary btn-sm appointment-button";
                                button.value = appt;
                                appointment_am.appendChild(button);
    
                                // remove button
                                button.addEventListener('click', (event) => {
                                    event.stopPropagation();
                                    let current_time = button.value;
                                    checkedDays[activeIndex].forEach(day => {
                                        amDicts[activeIndex][day] = amDicts[activeIndex][day].filter(item => item != current_time);
                                    });
                                    appointment_am.removeChild(button);
                                });
                            });
                        }
                            
                        if (pm_appts.length > 0) {
                            pm_appts.forEach(appt => {
                                if (appt != "") {
                                    let button = document.createElement('input');
                                    button.type = "button";
                                    button.className = "btn btn-primary btn-sm appointment-button";
                                    button.value = appt;
                                    appointment_pm.appendChild(button);
        
                                    // Remove button
                                    button.addEventListener('click', (event) => {
                                        event.stopPropagation();
                                        let current_time = button.value;
                                        checkedDays[activeIndex].forEach(day => {
                                            pmDicts[activeIndex][day] = pmDicts[activeIndex][day].filter(item => item != current_time);
                                        });
                                        appointment_pm.removeChild(button);
                                    });
                                }
                                
                            });
                        } 
                        console.log(checkedDays)
                    });
    
                    day_index++;
                });
    
                // Click on create appointment button
                appt_button.addEventListener('click', (event) => {
                    event.stopPropagation()
                    let hours_value = hours.value;
                    let minutes_value = minutes.value;
                    if (minutes_value == 0) {
                        minutes_value = "00";
                    } else {
                        minutes_value = String(minutes_value);
                    }
                    let ampm_value = am_pm.value;
                    
                    let button = document.createElement('input');
                    button.type = "button";
                    button.className = "btn btn-primary btn-sm appointment-button";
                    let button_value = String(hours_value).concat(":", minutes_value);
                    button.value = button_value;
                    
                    // Check if there are any checked days
                    if (checkedDays[activeIndex].length > 0) {
                        if (ampm_value == "AM") {
                            // Doesn't already have time
                            if (amDicts[activeIndex][checkedDays[activeIndex][0]].includes(button_value) == false) {
                                // Sort the elements in order of time
                                let am_times = []
                                let times_12 = [];
                                let am_appointments = amDicts[activeIndex][checkedDays[activeIndex][0]];
                                appointment_am.innerHTML = '';
                                // Get times and times in the 12th hour separately
                                let times = [];
                                am_appointments.forEach(appt => {
                                    let data_elements = appt.split(":");
                                    let number = data_elements[0].concat(data_elements[1]);
                                    if (data_elements[0] == "12") {
                                        times_12.push(parseInt(number));
                                    } else {
                                        times.push(parseInt(number));
                                    }
                                });
                                if (hours_value == "12") {
                                    times_12.push(parseInt(hours_value.concat(minutes_value)));
                                } else {
                                    times.push(parseInt(hours_value.concat(minutes_value)));
                                }
    
                                if (times.length > 1) {
                                    times.sort((a,b)=>a-b);
                                }
                                if (times_12.length > 1) {
                                    times_12.sort((a,b)=>a-b);
                                }
    
                                let appt_times = times_12.concat(times);
                                // Convert back to String
                                let t;
                                for (let i = 0; i < appt_times.length; i++) {
                                    t = String(appt_times[i]);
                                    if (t.length == 4) {
                                        am_times.push(t.slice(0, 2) + ":" + t.slice(2, 4)); 
                                    } else if (t.length == 3) {
                                        am_times.push(t.slice(0, 1) + ":" + t.slice(1, 3)); 
                                    }
                                }
                                
                                am_times.forEach(am_time => {
                                    let button = document.createElement('input');
                                    button.type = "button";
                                    button.className = "btn btn-primary btn-sm appointment-button";
                                    button.value = am_time;
                                    appointment_am.appendChild(button);
    
                                    // Clicking on the appt removes it
                                    button.addEventListener('click', (event) => {
                                        event.stopPropagation();
                                        let current_time = button.value;
                                        checkedDays[activeIndex].forEach(day => {
                                            amDicts[activeIndex][day] = amDicts[activeIndex][day].filter(item => item != current_time);
                                        });
                                        appointment_am.removeChild(button);
                                    });
                                });
    
                                console.log(am_times)
    
                                // add time to the other checked days
                                checkedDays[activeIndex].forEach(day => {
                                    // if (amDicts[activeIndex][day].includes(button_value) == false) {
                                    amDicts[activeIndex][day] = am_times;
                                    // }      
                                });
                            } 
                        } else if (ampm_value == "PM") {
                            // doesn't already have time
                            if (pmDicts[activeIndex][checkedDays[activeIndex][0]].includes(button_value) == false) {
                                // Sort the elements in order of time
                                let pm_appointments = pmDicts[activeIndex][checkedDays[activeIndex][0]];
                                let pm_times = [];
                                let times_12 = [];
                                let times = [];
                                appointment_pm.innerHTML = '';
                                // Get times and times in the 12th hour separately
                                // Convert to numbers
                                pm_appointments.forEach(appt => {
                                    let data_elements = appt.split(":");
                                    let number = data_elements[0].concat(data_elements[1]);
                                    if (data_elements[0] == "12") {
                                        times_12.push(parseInt(number));
                                    } else {
                                        times.push(parseInt(number));
                                    }
                                });
                                if (hours_value == "12") {
                                    times_12.push(parseInt(hours_value.concat(minutes_value)));
                                } else {
                                    times.push(parseInt(hours_value.concat(minutes_value)));
                                }
    
                                if (times.length > 1) {
                                    times.sort((a,b)=>a-b);
                                }
                                if (times_12.length > 1) {
                                    times_12.sort((a,b)=>a-b);
                                }
                                let appt_times = times_12.concat(times);
                                // Convert back to String
                                let t;
                                for (let i = 0; i < appt_times.length; i++) {
                                    t = String(appt_times[i]);
                                    if (t.length == 4) {
                                        pm_times.push(t.slice(0, 2) + ":" + t.slice(2, 4)); 
                                    } else if (t.length == 3) {
                                        pm_times.push(t.slice(0, 1) + ":" + t.slice(1, 3)); 
                                    }
                                }
                                
                                pm_times.forEach(pm_time => {
                                    let button = document.createElement('input');
                                    button.type = "button";
                                    button.className = "btn btn-primary btn-sm appointment-button";
                                    button.value = pm_time;
                                    appointment_pm.appendChild(button);
    
                                    // Remove button
                                    button.addEventListener('click', (event) => {
                                        event.stopPropagation();
                                        let current_time = button.value;
                                        checkedDays[activeIndex].forEach(day => {
                                            pmDicts[activeIndex][day] = pmDicts[activeIndex][day].filter(item => item != current_time);
                                        });
                                        appointment_pm.removeChild(button);
                                    });
                                });
                                console.log(pm_times);
                                // add time to the other checked days
                                checkedDays[activeIndex].forEach(day => {
                                    // if (pmDicts[activeIndex][day].includes(button_value) == false) {
                                    pmDicts[activeIndex][day] = pm_times;
                                    // }
                                });
                            } 
                        }
                    }
                    console.log(checkedDays)
                    console.log(amDicts[activeIndex][checkedDays[activeIndex][0]]);
                    console.log(pmDicts[activeIndex][checkedDays[activeIndex][0]]);
                });
    
                // End of service appointment form
    
                // Click on a tab
                nav_item.addEventListener('click', (event) => {
                    event.stopPropagation();
                    let tabs = document.getElementsByClassName('service-tab');
                    let new_tab = nav_item.firstElementChild;
                    let new_panel = document.getElementById(new_tab.getAttribute("aria-controls"));
                    // Not the same tab
                    if (new_tab != null) {
                        if (activeTab != new_tab) {
                            // Make current inactive
                            activeTab.classList.remove("active");
                            activeTab.setAttribute("aria-selected", "false");
                            activePanel.classList.remove("active");
                
                            new_tab.classList.add("active");
                            new_tab.setAttribute("aria-selected", "true");
                            new_panel.classList.add("active");
                
                            activeTab = new_tab;
                            activePanel = new_panel;
                            // Find active index by looping through the tabs
                            let panels = document.getElementsByClassName('tab-pane');
                            for (let i = 0; i < panels.length; i++) {
                                if (panels.item(i) == activePanel) {
                                    activeIndex = i;
                                    break;
                                }
                            }
                            // Load checked days
                            let day_labels = activePanel.firstChild.childNodes[2];
                            // Uncheck all days
                            for (let i = 0; i < day_labels.childNodes.length; i++) {
                                day_labels.childNodes[i].firstElementChild.checked = false;
                            }
                            let current_days = checkedDays[activeIndex];
                            let am_appts;
                            let pm_appts;
                            if (current_days.length > 0) {
                                // Check days
                                current_days.forEach(day => {
                                    for (let i = 0; i < day_labels.childNodes.length; i++) {
                                        // Check corresponding day
                                        if (day_labels.childNodes[i].innerText == day) {
                                            day_labels.childNodes[i].firstElementChild.checked = true;
                                            break;
                                        }
                                    }
                                });
                
                                am_appts = amDicts[activeIndex][current_days[0]];
                                pm_appts = pmDicts[activeIndex][current_days[0]];
                            } else {
                                am_appts = [];
                                pm_appts = [];
                            }
                
                            let appt_row = activePanel.firstChild.childNodes[6];
                            let am_container = appt_row.firstElementChild.lastElementChild;
                            let pm_container = appt_row.lastElementChild.lastElementChild;
                
                            am_container.innerHTML = '';
                            pm_container.innerHTML = '';
                
                            // Get am and pm appointments
                            if (am_appts.length > 0) {
                                am_appts.forEach(appt => {
                                    let button = document.createElement("input");
                                    button.type = "button";
                                    button.className = "btn btn-primary btn-sm appointment-button";
                                    let button_value = appt;
                                    button.value = button_value;
                                    am_container.appendChild(button);
    
                                    // remove button
                                    button.addEventListener('click', (event) => {
                                        event.stopPropagation();
                                        let current_time = button.value;
                                        checkedDays[activeIndex].forEach(day => {
                                            amDicts[activeIndex][day] = amDicts[activeIndex][day].filter(item => item != current_time);
                                        });
                                        am_container.removeChild(button);
                                    });
                                });
                            }   
                
                            if (pm_appts.length > 0) {
                                pm_appts.forEach(appt => {
                                    let button = document.createElement("input");
                                    button.type = "button";
                                    button.className = "btn btn-primary btn-sm appointment-button";
                                    let button_value = appt;
                                    button.value = button_value;
                                    pm_container.appendChild(button);
    
                                    // remove button
                                    button.addEventListener('click', (event) => {
                                        event.stopPropagation();
                                        let current_time = button.value;
                                        checkedDays[activeIndex].forEach(day => {
                                            pmDicts[activeIndex][day] = pmDicts[activeIndex][day].filter(item => item != current_time);
                                        });
                                        pm_container.removeChild(button);
                                    });
                                });
                            } 
                        }
                    }     
                });
    
                // Delete tab and panel
                let close_button = document.createElement('button');
                close_button.className = "close closeTab";
                close_button.type = "button";
                close_button.innerText = "×";
    
                // nav_item.addEventListener('mouseover', (event) => {
                //     event.target.appendChild(close_button);
                // Close tab button to delete service
                close_button.addEventListener('click', (event) => {
                    event.stopPropagation();
                    // Go to ul and remove li (nav-item) element, set previous as active tab
                    let tab = event.target.parentElement;
                    let tabs = document.getElementsByClassName('service-tab');
                    let tabs_length = tabs.length;
                    let panel = document.getElementById(tab.getAttribute("aria-controls"));
                    let panels = document.getElementsByClassName('tab-pane');
                    let index;
                    let t;
                    let p;
                    for (let i = 0; i < tabs_length; i++) {
                        if (tab == tabs.item(i)) {
                            index = i;
                            break;
                        }
                    }
                    // Remove tab and panel
                    tab.remove();
                    panel.remove();
    
                    amDicts = amDicts.filter(item => item != amDicts[index]);
                    pmDicts = pmDicts.filter(item => item != pmDicts[index]);
                    checkedDays = checkedDays.filter(item => item != checkedDays[index]);
    
                    if (activeTab == tab) {
                        // Loop through service tabs
                        if (tabs.length > 0) {
                            if (index == tabs.length) {
                                index--;
                                
                            }
                            
                            activeTab.classList.remove("active");
                            activeTab.setAttribute("aria-selected", "false");
                            activePanel.classList.remove("active");
    
                            t = tabs.item(index);
                            p = panels.item(index);
                            t.classList.add("active");
                            t.setAttribute("aria-selected", "true");
                            p.classList.add("active");
                            activeTab = t;
                            activePanel = p;
                            activeIndex = index;
                        }
                    } else {
                        if (index < activeIndex) {
                            activeIndex--;
                        }
                    }
                    console.log(activeIndex);
                        
                    if (tabs.length == 5) {
                        let create_tab = document.createElement('li');
                        let create_tab_link = document.createElement('div');
                        create_tab_link.innerText = "+ Service";
                        create_tab_link.className = "nav-link create-tab";
                        // next_nav_link.setAttribute("type", "button");
                        create_tab_link.setAttribute("role", "tab");
                        create_tab_link.setAttribute("aria-selected", "false");
    
                        create_tab.appendChild(create_tab_link);
                        tabNav.appendChild(create_tab);
                        // Remove "+ Service" tab and replace with new service tab and create service tab
                        create_tab.addEventListener('click', (event) => {
                            event.stopPropagation();
                            tabNav.removeChild(create_tab);
                            showTabPanelView();
                        });
                    } 
                });
                nav_link.appendChild(close_button);
                count++;
                // Increment service count
                serviceCount++;
            });
        let service_tabs = document.getElementsByClassName('service-tab');
        // Allow max 6 services
        if (service_tabs.length <= 5) {
            let next_nav_item = document.createElement('li');
            next_nav_item.className = "nav-item";
        
            let next_nav_link = document.createElement('div');
            next_nav_link.innerText = "+ Service";
            next_nav_link.className = "nav-link create-tab";
            // next_nav_link.setAttribute("type", "button");
            next_nav_link.setAttribute("role", "tab");
            next_nav_link.setAttribute("aria-selected", "false");
            next_nav_item.appendChild(next_nav_link);
            tabNav.appendChild(next_nav_item);
            // Remove "+ Service" tab and replace with new service tab and create service tab
            next_nav_item.addEventListener('click', (event) => {
                event.stopPropagation();
                let s_tabs = document.getElementsByClassName('service-tab');
                activeIndex = s_tabs.length;
                tabNav.removeChild(next_nav_item);
                showTabPanelView();
            });
        }
        // Check sunday for each service on load
        // let sunday_check = document.getElementsByClassName('days-row');
        // for (let i=0; i< sunday_check.length; i++) {
        //     sunday_check.item(i).firstElementChild.firstElementChild.click()
        // }

        } else {
            showTabPanelView();
        } 
    });
}

// Handles initial service tab and panel views along with a "+ Service" tab
function showTabPanelView() {
    let current_count = String(serviceCount);
    // Add service tab and next tab to tab nav bar
    let nav_item = document.createElement('li');
    nav_item.className = "nav-item";
    
    // Create link for service
    let nav_link = document.createElement('div');
    nav_link.id = "tab-".concat(current_count);
    // nav_link.setAttribute("type", "button");
    nav_link.setAttribute("role", "tab");
    nav_link.setAttribute("aria-controls", "service-".concat(current_count));
    if (serviceCount == 0) {
        nav_link.className = "nav-link active service-tab";
        nav_link.setAttribute("aria-selected", "true");
    } else {
        nav_link.className = "nav-link service-tab";
        nav_link.setAttribute("aria-selected", "false");
    }
    
    // For innerText
    let nav_text = document.createElement("span");
    nav_text.innerText = "Service";

    nav_link.appendChild(nav_text);
    nav_item.appendChild(nav_link);
    tabNav.appendChild(nav_item);

    // Append id 
    let service_id = document.createElement("input");
    service_id.className = "service-id";
    service_id.type = "hidden";
    service_id.value = null;
    nav_item.appendChild(service_id);

    // Create "+ Service" tab
    let next_nav_item = document.createElement('li');
    next_nav_item.className = "nav-item";

    let next_nav_link = document.createElement('div');
    next_nav_link.innerText = "+ Service";
    next_nav_link.className = "nav-link create-tab";
    // next_nav_link.setAttribute("type", "button");
    next_nav_link.setAttribute("role", "tab");
    next_nav_link.setAttribute("aria-selected", "false");
    next_nav_item.appendChild(next_nav_link);

    //  Add panel content
    let tab_pane = document.createElement("div");
    tab_pane.id = "service-".concat(current_count);
    tab_pane.setAttribute("role", "tabpanel");
    if (serviceCount == 0) {
        tab_pane.className = "tab-pane active";
    } else {
        tab_pane.className = "tab-pane";
        tab_pane.setAttribute("aria-labelledby", "service-".concat(current_count), "-tab");
    }
    paneContent.appendChild(tab_pane);

    // Beginning of service appointment form

    let service_form = document.createElement("div");
    service_form.className = "service-form";
    tab_pane.appendChild(service_form)

    let name_rate_row = document.createElement("div");
    name_rate_row.className = "row service-row";
    service_form.appendChild(name_rate_row)

    // Set service name input
    let service_name = document.createElement("input");
    service_name.className = "form-control service-name";
    service_name.id = "service-name-".concat(current_count)
    service_name.placeholder = "Name";
    service_name.focus();
    name_rate_row.appendChild(service_name);
    // Change tab to service name
    service_name.addEventListener('keyup', (event) => {
        event.stopPropagation();
        nav_text.innerText = service_name.value;
    });

    let service_rate = document.createElement("input")
    service_rate.className = "form-control service-rate";
    service_rate.placeholder = "Rate";
    service_rate.type = "number";
    name_rate_row.appendChild(service_rate);
    
    let time_row = document.createElement("div");
    time_row.className = "row service-row time-row";
    service_form.appendChild(time_row);

    let time_label = document.createElement("h5");
    time_label.innerText = "Time:";
    time_label.className = "time"
    time_row.appendChild(time_label);

    let hours = document.createElement('select');
    hours.className = "hours"
    time_row.appendChild(hours);

    for (let i = 0; i < 12; i++) {
        let hour = document.createElement('option');
        if (i == 0) {
            hour.value = 12;
            hour.innerText = 12;
        } else {
            hour.value = i;
            hour.innerText = i;
        }
        hours.appendChild(hour);
    }

    let colon = document.createElement("h5");
    colon.className = "colon";
    colon.innerText = ":";
    time_row.appendChild(colon);

    let minutes = document.createElement("select");
    minutes.className = "minutes";
    time_row.appendChild(minutes);
    for (let i=0; i < 4; i++) {
        let minute = document.createElement("option");
        if (i == 0) {
            minute.value = 00;
            minute.innerText = "00";
        } else {
            minute.value = i * 15;
            minute.innerText = i * 15;
        }
        minutes.appendChild(minute);
    }

    let am_pm = document.createElement("select");
    let am = document.createElement("option");
    am.value = "AM";
    am.innerText = "AM";
    let pm = document.createElement("option");
    pm.value = "PM";
    pm.innerText = "PM";
    time_row.appendChild(am_pm);
    am_pm.appendChild(am);
    am_pm.appendChild(pm);

    let days_row = document.createElement('div');
    days_row.className = "row days-row"
    service_form.appendChild(days_row);

    let button_row = document.createElement('div');
    button_row.className = "row";

    let appt_button = document.createElement('input');
    appt_button.type = "button";
    appt_button.className = "btn btn-primary btn-lg btn-block appointment-button";
    appt_button.value = "Create Appointment!";

    let hr = document.createElement('hr');

    let appointment_header = document.createElement('h6');
    appointment_header.className = "appointment-header";
    appointment_header.innerText = "Appointments:";

    let appointments = document.createElement('div');
    appointments.className = "row appointments";

    let left_div = document.createElement('div');
    left_div.className = "col left-div";

    let left_p = document.createElement('p');
    left_p.className = "centered-paragraph";
    left_p.innerHTML = "<u>AM</u>";

    let appointment_am = document.createElement('div');
    appointment_am.className = "appointment-div";
    appointment_am.id = "appointment-am";
    
    let right_div = document.createElement('div');
    right_div.className = "col right-div";

    let right_p = document.createElement('p');
    right_p.className = "centered-paragraph";
    right_p.innerHTML = "<u>PM</u>";

    let appointment_pm = document.createElement('div');
    appointment_pm.className = "appointment-div";
    appointment_pm.id = "appointment-pm";

    service_form.appendChild(button_row);
    button_row.appendChild(appt_button);
    service_form.appendChild(hr);
    service_form.appendChild(appointment_header);
    service_form.appendChild(appointments)
    appointments.appendChild(left_div);
    left_div.appendChild(left_p);
    left_div.appendChild(appointment_am);
    appointments.appendChild(right_div);
    right_div.appendChild(right_p); 
    right_div.appendChild(appointment_pm);

    // Create labels and checkboxes for labels and days of the week
    let am_appts;
    let pm_appts;
    let am_appt_dict = {
        "Sun": [],
        "Mon": [],
        "Tue": [],
        "Wed": [],
        "Thu": [],
        "Fri": [],
        "Sat": [],
    };
    let pm_appt_dict = {
        "Sun": [],
        "Mon": [],
        "Tue": [],
        "Wed": [],
        "Thu": [],
        "Fri": [],
        "Sat": [],
    };
    amDicts.push(am_appt_dict);
    pmDicts.push(pm_appt_dict);
    checkedDays.push([]);
    let day_index = 0;
    days.forEach(day => {
        let current_index = day_index;
        let current_day = day;
        let label = document.createElement('label');
        label.className = "day-label";
        label.innerText = day;
        let check = document.createElement('input');
        check.className = "check";
        check.id = day;
        check.type = "checkbox";
        label.appendChild(check);
        days_row.appendChild(label);

        check.addEventListener('click', (event) => {
            event.stopPropagation();
            // Get the appointments for the checked day
            am_appts = amDicts[activeIndex][check.id];
            pm_appts = pmDicts[activeIndex][check.id];
            if (check.checked) {
                // Add to checked days
                checkedDays[activeIndex].push(check.id);
                // If other days have the exact same appointment times check those too
                for (let i = 0; i < 7; i++) {
                    // Not for current day
                    if (i != days.indexOf(check.id)) {
                        let other_day = days[i];
                        let other_day_am_appts = amDicts[activeIndex][other_day];
                        let other_day_pm_appts = pmDicts[activeIndex][other_day];

                        // Check same length
                        let am_flag = 0;
                        let pm_flag = 0;
                        if (am_appts.length == other_day_am_appts.length && pm_appts.length == other_day_pm_appts.length) {
                            // Loop through both arrays
                            // Check if am appts are the same
                            for (let j = 0; j < am_appts.length; j++) {
                                if (other_day_am_appts[j] != am_appts[j]) {
                                    am_flag = 1;
                                }
                            }
                            // Check if pm appts are the same
                            for (let k = 0; k < pm_appts.length; k++) {
                                if (other_day_pm_appts[k] != pm_appts[k]) {
                                    pm_flag = 1;
                                }
                            }  
                        } else {
                            am_flag = 1;
                            pm_flag = 1;
                        }

                        // If both are the same then check the checkbox for the corresponding day and add to checked days list
                        if (am_flag == 0 && pm_flag == 0) {
                            if (checkedDays[activeIndex].includes(days[i]) == false) {
                                service_form.childNodes[2].childNodes[i].firstElementChild.checked = true;
                                checkedDays[activeIndex].push(days[i]);
                            }  
                        } else {
                            if (checkedDays[activeIndex].includes(days[i])) {
                                service_form.childNodes[2].childNodes[i].firstElementChild.checked = false;
                                checkedDays[activeIndex] = checkedDays[activeIndex].filter(item => item != days[i]);
                            }       
                        }
                    }
                }
            //  Remove from checked days list if unchecked
            } else if (check.checked == false) {
                checkedDays[activeIndex] = checkedDays[activeIndex].filter(item => item != check.id);
                if (checkedDays[activeIndex].length == 0) {
                    am_appts = [];
                    pm_appts = [];
                }
            }

            appointment_am.innerHTML = '';
            appointment_pm.innerHTML = '';

            if (am_appts.length > 0) {
                am_appts.forEach(appt => {
                    let button = document.createElement('input');
                    button.type = "button";
                    button.className = "btn btn-primary btn-sm appointment-button";
                    button.value = appt;
                    appointment_am.appendChild(button);

                    // remove button
                    button.addEventListener('click', (event) => {
                        event.stopPropagation();
                        let current_time = button.value;
                        checkedDays[activeIndex].forEach(day => {
                            amDicts[activeIndex][day] = amDicts[activeIndex][day].filter(item => item != current_time);
                        });
                        appointment_am.removeChild(button);
                    });
                });
            }
                
            if (pm_appts.length > 0) {
                pm_appts.forEach(appt => {
                    let button = document.createElement('input');
                    button.type = "button";
                    button.className = "btn btn-primary btn-sm appointment-button";
                    button.value = appt;
                    appointment_pm.appendChild(button);

                    // Remove button
                    button.addEventListener('click', (event) => {
                        event.stopPropagation();
                        let current_time = button.value;
                        checkedDays[activeIndex].forEach(day => {
                            pmDicts[activeIndex][day] = pmDicts[activeIndex][day].filter(item => item != current_time);
                        });
                        appointment_pm.removeChild(button);
                    });
                });
            } 
            console.log(checkedDays)
        });

        day_index++;
    });

    // Click on create appointment button
    appt_button.addEventListener('click', (event) => {
        event.stopPropagation()
        let hours_value = hours.value;
        let minutes_value = minutes.value;
        if (minutes_value == 0) {
            minutes_value = "00";
        } else {
            minutes_value = String(minutes_value);
        }
        let ampm_value = am_pm.value;
        
        let button = document.createElement('input');
        button.type = "button";
        button.className = "btn btn-primary btn-sm appointment-button";
        let button_value = String(hours_value).concat(":", minutes_value);
        button.value = button_value;
        
        // Check if there are any checked days
        if (checkedDays[activeIndex].length > 0) {
            if (ampm_value == "AM") {
                // Doesn't already have time
                if (amDicts[activeIndex][checkedDays[activeIndex][0]].includes(button_value) == false) {
                    // Sort the elements in order of time
                    let am_times = []
                    let times_12 = [];
                    let am_appointments = amDicts[activeIndex][checkedDays[activeIndex][0]];
                    appointment_am.innerHTML = '';
                    // Get times and times in the 12th hour separately
                    let times = [];
                    am_appointments.forEach(appt => {
                        let data_elements = appt.split(":");
                        let number = data_elements[0].concat(data_elements[1]);
                        if (data_elements[0] == "12") {
                            times_12.push(parseInt(number));
                        } else {
                            times.push(parseInt(number));
                        }
                    });
                    if (hours_value == "12") {
                        times_12.push(parseInt(hours_value.concat(minutes_value)));
                    } else {
                        times.push(parseInt(hours_value.concat(minutes_value)));
                    }

                    if (times.length > 1) {
                        times.sort((a,b)=>a-b);
                    }
                    if (times_12.length > 1) {
                        times_12.sort((a,b)=>a-b);
                    }

                    let appt_times = times_12.concat(times);
                    // Convert back to String
                    let t;
                    for (let i = 0; i < appt_times.length; i++) {
                        t = String(appt_times[i]);
                        if (t.length == 4) {
                            am_times.push(t.slice(0, 2) + ":" + t.slice(2, 4)); 
                        } else if (t.length == 3) {
                            am_times.push(t.slice(0, 1) + ":" + t.slice(1, 3)); 
                        }
                    }
                    
                    am_times.forEach(am_time => {
                        let button = document.createElement('input');
                        button.type = "button";
                        button.className = "btn btn-primary btn-sm appointment-button";
                        button.value = am_time;
                        appointment_am.appendChild(button);

                        // Clicking on the appt removes it
                        button.addEventListener('click', (event) => {
                            event.stopPropagation();
                            let current_time = button.value;
                            checkedDays[activeIndex].forEach(day => {
                                amDicts[activeIndex][day] = amDicts[activeIndex][day].filter(item => item != current_time);
                            });
                            appointment_am.removeChild(button);
                        });
                    });

                    console.log(am_times)

                    // add time to the other checked days
                    checkedDays[activeIndex].forEach(day => {
                        // if (amDicts[activeIndex][day].includes(button_value) == false) {
                        amDicts[activeIndex][day] = am_times;
                        // }      
                    });
                } 
                
            } else if (ampm_value == "PM") {
                // doesn't already have time
                if (pmDicts[activeIndex][checkedDays[activeIndex][0]].includes(button_value) == false) {
                    // Sort the elements in order of time
                    let pm_appointments = pmDicts[activeIndex][checkedDays[activeIndex][0]];
                    let pm_times = [];
                    let times_12 = [];
                    let times = [];
                    appointment_pm.innerHTML = '';
                    // Get times and times in the 12th hour separately
                    // Convert to numbers
                    pm_appointments.forEach(appt => {
                        let data_elements = appt.split(":");
                        let number = data_elements[0].concat(data_elements[1]);
                        if (data_elements[0] == "12") {
                            times_12.push(parseInt(number));
                        } else {
                            times.push(parseInt(number));
                        }
                    });
                    if (hours_value == "12") {
                        times_12.push(parseInt(hours_value.concat(minutes_value)));
                    } else {
                        times.push(parseInt(hours_value.concat(minutes_value)));
                    }

                    if (times.length > 1) {
                        times.sort((a,b)=>a-b);
                    }
                    if (times_12.length > 1) {
                        times_12.sort((a,b)=>a-b);
                    }
                    let appt_times = times_12.concat(times);
                    // Convert back to String
                    let t;
                    for (let i = 0; i < appt_times.length; i++) {
                        t = String(appt_times[i]);
                        if (t.length == 4) {
                            pm_times.push(t.slice(0, 2) + ":" + t.slice(2, 4)); 
                        } else if (t.length == 3) {
                            pm_times.push(t.slice(0, 1) + ":" + t.slice(1, 3)); 
                        }
                    }
                    
                    pm_times.forEach(pm_time => {
                        let button = document.createElement('input');
                        button.type = "button";
                        button.className = "btn btn-primary btn-sm appointment-button";
                        button.value = pm_time;
                        appointment_pm.appendChild(button);

                        // Remove button
                        button.addEventListener('click', (event) => {
                            event.stopPropagation();
                            let current_time = button.value;
                            checkedDays[activeIndex].forEach(day => {
                                pmDicts[activeIndex][day] = pmDicts[activeIndex][day].filter(item => item != current_time);
                            });
                            appointment_pm.removeChild(button);
                        });
                    });
                

                    console.log(pm_times);
                    // add time to the other checked days
                    checkedDays[activeIndex].forEach(day => {
                        // if (pmDicts[activeIndex][day].includes(button_value) == false) {
                        pmDicts[activeIndex][day] = pm_times;
                        // }
                    });
                } 
            }
        }
        console.log(checkedDays)
        console.log(amDicts[activeIndex][checkedDays[activeIndex][0]]);
        console.log(pmDicts[activeIndex][checkedDays[activeIndex][0]]);
    });
    // End of service appointment form


    // Change active tab and panel
    if (serviceCount != 0) {
        activeTab.classList.remove("active");
        activeTab.setAttribute("aria-selected", "false");
        activePanel.classList.remove("active");

        nav_link.classList.add("active");
        nav_link.setAttribute("aria-selected", "true");
        tab_pane.classList.add("active");
    }

    activeTab = nav_link;
    activePanel = tab_pane;
    let service_tabs = document.getElementsByClassName('service-tab');
    
    // Click on a tab
    nav_item.addEventListener('click', (event) => {
        event.stopPropagation();
        let tabs = document.getElementsByClassName('service-tab');
        let new_tab = nav_item.firstElementChild;
        let new_panel = document.getElementById(new_tab.getAttribute("aria-controls"));
        // Not the same tab
        if (new_tab != null) {
            if (activeTab != new_tab) {
                // Make current inactive
                activeTab.classList.remove("active");
                activeTab.setAttribute("aria-selected", "false");
                activePanel.classList.remove("active");
    
                new_tab.classList.add("active");
                new_tab.setAttribute("aria-selected", "true");
                new_panel.classList.add("active");
    
                activeTab = new_tab;
                activePanel = new_panel;
                // Find active index by looping through the tabs
                let panels = document.getElementsByClassName('tab-pane');
                for (let i = 0; i < panels.length; i++) {
                    if (panels.item(i) == activePanel) {
                        activeIndex = i;
                        break;
                    }
                }
                // Load checked days
                let day_labels = activePanel.firstChild.childNodes[2];
                // Uncheck all days
                for (let i = 0; i < day_labels.childNodes.length; i++) {
                    day_labels.childNodes[i].firstElementChild.checked = false;
                }
                let current_days = checkedDays[activeIndex];
                let am_appts;
                let pm_appts;
                if (current_days.length > 0) {
                    // Check days
                    current_days.forEach(day => {
                        for (let i = 0; i < day_labels.childNodes.length; i++) {
                            // Check corresponding day
                            if (day_labels.childNodes[i].innerText == day) {
                                day_labels.childNodes[i].firstElementChild.checked = true;
                                break;
                            }
                        }
                    });
    
                    am_appts = amDicts[activeIndex][current_days[0]];
                    pm_appts = pmDicts[activeIndex][current_days[0]];
                } else {
                    am_appts = [];
                    pm_appts = [];
                }
    
                let appt_row = activePanel.firstChild.childNodes[6];
                let am_container = appt_row.firstElementChild.lastElementChild;
                let pm_container = appt_row.lastElementChild.lastElementChild;
    
                am_container.innerHTML = '';
                pm_container.innerHTML = '';
    
                // Get am and pm appointments
                if (am_appts.length > 0) {
                    am_appts.forEach(appt => {
                        let button = document.createElement("input");
                        button.type = "button";
                        button.className = "btn btn-primary btn-sm appointment-button";
                        let button_value = appt;
                        button.value = button_value;
                        am_container.appendChild(button);

                        // remove button
                        button.addEventListener('click', (event) => {
                            event.stopPropagation();
                            let current_time = button.value;
                            checkedDays[activeIndex].forEach(day => {
                                amDicts[activeIndex][day] = amDicts[activeIndex][day].filter(item => item != current_time);
                            });
                            am_container.removeChild(button);
                        });
                    });
                }   
    
                if (pm_appts.length > 0) {
                    pm_appts.forEach(appt => {
                        let button = document.createElement("input");
                        button.type = "button";
                        button.className = "btn btn-primary btn-sm appointment-button";
                        let button_value = appt;
                        button.value = button_value;
                        pm_container.appendChild(button);

                        // remove button
                        button.addEventListener('click', (event) => {
                            event.stopPropagation();
                            let current_time = button.value;
                            checkedDays[activeIndex].forEach(day => {
                                pmDicts[activeIndex][day] = pmDicts[activeIndex][day].filter(item => item != current_time);
                            });
                            pm_container.removeChild(button);
                        });
                    });
                } 
            }
        }     
    });

    // Allow max 6 services
    if (service_tabs.length <= 5 || service_tabs == null) {
        tabNav.appendChild(next_nav_item);
        // Remove "+ Service" tab and replace with new service tab and create service tab
        next_nav_item.addEventListener('click', (event) => {
            event.stopPropagation();
            let s_tabs = document.getElementsByClassName('service-tab');
            activeIndex = s_tabs.length;
            tabNav.removeChild(next_nav_item);
            showTabPanelView();
        });
    }

    // Delete tab and panel
    let close_button = document.createElement('button');
    close_button.className = "close closeTab";
    close_button.type = "button";
    close_button.innerText = "×";

    // nav_item.addEventListener('mouseover', (event) => {
    //     event.target.appendChild(close_button);
    // Close tab button to delete service
    close_button.addEventListener('click', (event) => {
        event.stopPropagation();
        // Go to ul and remove li (nav-item) element, set previous as active tab
        let tab = event.target.parentElement;
        let tabs = document.getElementsByClassName('service-tab');
        let tabs_length = tabs.length;
        let panel = document.getElementById(tab.getAttribute("aria-controls"));
        let panels = document.getElementsByClassName('tab-pane');
        let index;
        let t;
        let p;
        for (let i = 0; i < tabs_length; i++) {
            if (tab == tabs.item(i)) {
                index = i;
                break;
            }
        }
        // Remove tab and panel
        tab.remove();
        panel.remove();

        amDicts = amDicts.filter(item => item != amDicts[index]);
        pmDicts = pmDicts.filter(item => item != pmDicts[index]);
        checkedDays = checkedDays.filter(item => item != checkedDays[index]);

        if (activeTab == tab) {
            // Loop through service tabs
            if (tabs.length > 0) {
                if (index == tabs.length) {
                    index--;
                    
                }
                
                activeTab.classList.remove("active");
                activeTab.setAttribute("aria-selected", "false");
                activePanel.classList.remove("active");

                t = tabs.item(index);
                p = panels.item(index);
                t.classList.add("active");
                t.setAttribute("aria-selected", "true");
                p.classList.add("active");
                activeTab = t;
                activePanel = p;
                activeIndex = index;
            }
        } else {

            if (index < activeIndex) {
                activeIndex--;
            }
            
        }
        console.log(activeIndex);
             
        if (tabs.length == 5) {
            let create_tab = document.createElement('li');
            let create_tab_link = document.createElement('div');
            create_tab_link.innerText = "+ Service";
            create_tab_link.className = "nav-link create-tab";
            // next_nav_link.setAttribute("type", "button");
            create_tab_link.setAttribute("role", "tab");
            create_tab_link.setAttribute("aria-selected", "false");

            create_tab.appendChild(create_tab_link);
            tabNav.appendChild(create_tab);
            // Remove "+ Service" tab and replace with new service tab and create service tab
            create_tab.addEventListener('click', (event) => {
                event.stopPropagation();
                tabNav.removeChild(create_tab);
                showTabPanelView();
            });
        } 

        
    });
    nav_link.appendChild(close_button);

    // Increment service count
    serviceCount++;
}


function submitListing() {
    let listing_form = document.getElementById('listing-form');
    listing_form.addEventListener('submit', (event) => {
        event.preventDefault();
        let service_tabs = document.getElementsByClassName('service-tab');
        let service_panels = document.getElementsByClassName('tab-pane');
        let service_count = service_panels.length;
        let service_names = [];
        let service_rates = [];
        let service_times = [];
        let am_times = "";
        let pm_times = "";
        let current_times;
        let current_tab;
        let current_panel;
        if (service_count > 0) {
            for (let i = 0; i < service_count; i++) {
                current_tab = service_tabs.item(i);
                current_panel = service_panels.item(i);
                service_names.push(current_panel.firstElementChild.firstElementChild.firstElementChild.value);
                service_rates.push(current_panel.firstElementChild.firstElementChild.firstElementChild.nextElementSibling.value);
                current_times = "";
                // Get times
                for (let j = 0; j < 7; j++) {
                    if (amDicts[i][days[j]] != undefined) {
                        am_times = amDicts[i][days[j]].join();
                        // console.log(am_times)
                        
                    }
                    if (pmDicts[i][days[j]] != undefined) {
                        pm_times = pmDicts[i][days[j]].join();
                        // console.log(pm_times)
                    }
                    current_times = current_times + am_times + "-" + pm_times;
                    
                    if (j != 6) {
                        current_times = current_times + ";";
                    }
                    console.log(current_times);
                }
                if (current_times == '-;-;-;-;-;-;-') {
                    current_times = "";
                }
                service_times.push(current_times);
            }
            
        } else {
            // No services
            service_names = [''];
            service_rates = [''];
            service_times = [''];
        }
        
        let service_ids = document.getElementsByClassName('service-id');
        let ids = [];
        for (let i=0;i<service_ids.length;i++) {
            ids.push(parseInt(service_ids.item(i).value));
        }        

        let listing_username = document.getElementById('username').value;
        let listing_id = document.getElementById('listing-id').value;
        let listing_title = document.getElementById('title').value;
        let listing_type = document.getElementById('listing-type').value;
        let listing_address = document.getElementById('address').value;
        let listing_location = document.getElementById('location').value;
        let listing_description = document.getElementById('description').value;

        // Send POST request
        const request = new Request(
            '/edit-listing',
            {headers: {'X-CSRFToken': csrftoken}}
        );
        fetch(request, {
            method: 'POST',
            mode: 'same-origin',
            body: JSON.stringify({
                username: listing_username,
                listing_id: listing_id,
                title: listing_title,
                listing_type: listing_type,
                address: listing_address,
                location: listing_location,
                description: listing_description,
                service_ids: ids,
                original_ids: originalIDs,
                names: service_names,
                rates: service_rates,
                times: service_times,
            }),
        })
        .then(response => response.json())
        .then(result => {
            if (result.message) {
                // Good input
                let url = window.location.origin + "/listing/" + listing_title + "/" + listing_id;
                document.location.href = url;
            } 
            if (result.errors) {
                let error_messages = result.errors;
                let error_container = document.getElementById('errors');
                error_container.innerHTML = ``;
                let err = document.createElement('p');
                err.className = "error";
                err.innerText = "Errors";
                error_container.appendChild(err);
                error_messages.forEach(message => {
                    let li = document.createElement('li');
                    li.className = "error";
                    li.innerText = message;
                    error_container.appendChild(li)
                });
            } 
        });    
    });
}

