var selectedServiceButton;
var selectedAppointmentButton;


document.addEventListener("DOMContentLoaded", function () {
    clickServiceButton();
    
});

function clickServiceButton() {
    let service_buttons = Array.from(document.getElementsByClassName('service-button'));
    if (service_buttons == undefined) {
        let appointment_body = document.getElementById("appointment-body");
        appointment_body.innerHTML = "No Appointments.";
    } else {
        // Load appointments for first element
        selectedServiceButton = service_buttons[0];
        selectedServiceButton.classList.add("active");
        loadAppointments(service_buttons[0].id);
        
        // add click event listener and button presser to all elements
        service_buttons.forEach(element => {
            console.log(element)
            // First element

            // Listen to each button to see if it is clicked
            element.addEventListener('click', () => {
                
                loadAppointments(element.id);
                selectedServiceButton.classList.remove("active");
                selectedServiceButton = element;
                selectedServiceButton.classList.add("active");
            });
        });
    }
    let index = 0;
    
}

function loadAppointments(service_name) {
    let listing_title = document.getElementById("listing-title").innerText;
    fetch(`/get_appointments/${listingID}/${service_name}/${selectedDay}/${selectedDate}/${selectedMonth}/${selectedYear}`)
    .then(response => response.json())
    .then(result => {
        let appointment_am = document.getElementById('appointment-am');
        let appointment_pm = document.getElementById('appointment-pm');
        appointment_am.innerHTML = "";
        appointment_pm.innerHTML = "";
        console.log(result);
        let am_appointments = result.am_appointments;
        let pm_appointments = result.pm_appointments;
        let am_count = 0;
        if (am_appointments != '') {
            am_appointments.forEach(element => {
                let button = document.createElement('button');
                button.type = "button";
                button.className = "btn btn-primary btn-sm appointment-button";
                button.innerHTML = `${element}`;
                appointment_am.appendChild(button);
                button.addEventListener('click', () => {
                    if (selectedAppointmentButton == undefined) {
                        selectedAppointmentButton = button;
                        selectedAppointmentButton.classList.add('active');
                    } else {
                        selectedAppointmentButton.classList.remove('active');
                        selectedAppointmentButton = button;
                        selectedAppointmentButton.classList.add('active');
                    }

                });
                am_count++;
            });    
        }
        
        let pm_count = 0;
        if (result.pm_appointments != '') {
            result.pm_appointments.forEach(element => {
                let button = document.createElement('button');
                button.type = "button";
                button.className = "btn btn-primary btn-sm appointment-button";
                button.innerHTML = `${element}`;
                appointment_pm.appendChild(button);
                button.addEventListener('click', () => {
                    if (selectedAppointmentButton == undefined) {
                        selectedAppointmentButton = button;
                        selectedAppointmentButton.classList.add('active');
                    } else {
                        selectedAppointmentButton.classList.remove('active');
                        selectedAppointmentButton = button;
                        selectedAppointmentButton.classList.add('active');
                    }
                });

                pm_count++;
                // add empty inputs to am to increase size of the border
                if (pm_count > am_count) {
                    let invisible_button = document.createElement("button");
                    invisible_button.className = "btn btn-primary btn-sm invisible-button";
                    invisible_button.innerHTML = element;
                    invisible_button.disabled = true;
                    appointment_am.appendChild(invisible_button);
                }
            });     
        }
    });
}