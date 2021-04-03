document.addEventListener("DOMContentLoaded", function () {
    loadSkeleton();
});

function loadSkeleton() {
    let service_card = document.getElementById('edit-service-card');
    service_card.innerHTML = `
    <div class="card">
    <div class="card-header">
        <ul class="nav nav-tabs card-header-tabs" id="tab-nav" role="tablist">
        </ul>
    </div>
    <div class="card-body">
        <div class="tab-content mt-3" id="pane-content">
        </div>
    </div>
</div>
    `;
}
