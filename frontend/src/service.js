import axios from 'axios';
const API_URL = 'http://localhost:8000';

export default class Service{
    constructor(){}
    
    getServices(){
        const url = `${API_URL}/api/services/`;
        return axios.get(url).then(response => response.data);
    }

    getService(){
        
    }
}