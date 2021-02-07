import axios from 'axios';
const API_URL = 'http://localhost:8000';

export default class Service{
    constructor(){}
    
    getServices(){
        const url = `${API_URL}/api/services/`;
        return axios.get(url).then(response => response.data);
    }

    getServiceByURL(link){
        const url = `${API_URL}${link}`;
        return axios.get(url).then(response => response.data);
    }

    getService(title){
        let titleLower = title.toLowerCase();
        const url = `${API_URL}/api/services/${titleLower}`;
        return axios.get(url).then(response => response.data);
    }

    // deleteService(service){
    //     const url = `${API_URL}/api/services/${ServiceList}`;
    //     return axios.delete(url);
    // }

    // createService(service){
    //     const url = `${API_URL}/api/services/`;
    //     return axios.post(url, service);
    // }
    // updateService(service){
    //     const url = `${API_URL}/api/services/${service.pk}`;
    //     return axios.put(url,service);
    // }
}