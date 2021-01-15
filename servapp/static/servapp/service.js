document.addEventListener("DOMContentLoaded", function () {
    
    service_page();
    

});


function service_page(properties, owner) {
    document.querySelector('.service-view').style.display = "block"; 
 
    // let page_view = document.querySelector(".page-view");

    // console.log(properties);

    // // Display property elements
    // document.querySelector('.properties-title').innerHTML = properties.title;
    // document.querySelector('.properties-owner').innerHTML = `Owner: ${owner}`;
    // document.querySelector('.properties-service-type').innerHTML = properties.service_type;
    // document.querySelector('.properties-rate').innerHTML = `Rate: ${properties.rate}/hr`;  
    // document.querySelector('.properties-description').innerHTML = properties.description;
    
    // let username = document.querySelector('#username').value;
    // let create_review = document.querySelector('.create-review');
    // console.log(username)
    // console.log(owner)
    // if (username != undefined && username != "") {
    //     create_review.style.display = 'block';
    //     let service_title = document.createElement('input');
    //     service_title.type = 'hidden';
    //     service_title.name = 'service_title';
    //     service_title.id = 'service-title';
    //     service_title.value = properties.title;
    //     document.querySelector('#review-form').appendChild(service_title)

    // } else {
    //     create_review.style.display = 'none';

    // }

    // fetch(`/get_reviews/${properties.title}`)
    // .then(response => response.json())
    // .then(result => {
    //     let reviews = document.querySelector('.reviews');
    //     if (reviews.hasChildNodes()) {
    //         reviews.removeChild(reviews.childNodes[0]);
    //     }

    //     if (result === undefined) {
            
    //         let no_reviews = document.createElement('h3');
    //         no_reviews.innerHTML = "No reviews for this listing"
    //         reviews.appendChild(no_reviews)
    //     } else {

    //         result.forEach((element) => {
    //             let review_writer = document.createElement("h3");    
    //             review_writer.innerHTML = element.writer;
    //             let review_stars = document.createElement("h6"); 
    //             review_stars.innerHTML = `${element.stars} Stars`;
    //             let review_text = document.createElement("p");
    //             review_text.innerHTML = element.text;

                
    //             reviews.appendChild(review_writer);
    //             reviews.appendChild(review_stars);
    //             reviews.appendChild(review_text);
    //             reviews.appendChild(document.createElement("hr"));
                
    //         })
    //     }
    //     });

    // geocoder_nav.on('result', (search_data) => {
    //     let st = document.querySelector('#search-field').value;
    //     search(search_data, st);
    // });
}