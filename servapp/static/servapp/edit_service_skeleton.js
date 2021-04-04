document.addEventListener("DOMContentLoaded", function () {
    loadSkeleton();
});

function loadSkeleton() {
    let service_card = document.getElementById('edit-service-card');
    let card = document.createElement("div");
    card.className = "card";
    service_card.appendChild(card);

    let card_header = document.createElement("div");
    card_header.className = "card-header";
    card.appendChild(card_header);

    let tab_nav = document.createElement("ul");
    tab_nav.className = "nav nav-tabs card-header-tabs";
    tab_nav.id = "tab-nav";
    tab_nav.setAttribute("role", "tablist");
    card_header.appendChild(tab_nav);

    let card_body = document.createElement("div");
    card_body.className = "card-body";
    card.appendChild(card_body);

    let tab_content = document.createElement("tab-content");
    tab_content.className = "tab-content mt-3";
    tab_content.id = "pane-content";
    card_body.appendChild(tab_content)

}
