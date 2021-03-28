document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('services-view').innerHTML = `
        <div class="card">
        <div class="card-header">
            <ul class="nav nav-tabs card-header-tabs" id="nav-tab" role="tablist">
                <li class="nav-item active">
                    <button class="nav-link active" data-toggle="tab" role="tab" aria-controls="service_01" aria-selected="true" data-toggle="tab">Joe Smith</button><span>x</span>
                </li>
                <li>
                    <button class="nav-link" href="#" class="add-contact" data-toggle="tab">+ Add Contact</button>
                </li>
            </ul>
        </div>
        <div class="card-body">
            <div class="tab-content">
                <div class="tab-pane active" id="contact_01">Contact Form: Joe Smith</div>
            </div>
        </div>
    </div>
    `;
});

$(".nav-tabs").on("click", "button", function(e){
    e.preventDefault();
    $(this).tab('show');
})
.on("click", "span", function () {
    var anchor = $(this).siblings('button');
    $(this).parent().remove();
    $(".nav-tabs li").children('button').first().click();
});

$('.add-contact').click(function(e) {
    e.preventDefault();
    var id = $(".nav-tabs").children().length; //think about it ;)
    $(this).closest('li').before('<li><button >Service</button><span>x</span></li>');         
    $('.tab-content').append('<div class="tab-pane" id="service_'+id+'">Contact Form: New Contact '+id+'</div>');
});