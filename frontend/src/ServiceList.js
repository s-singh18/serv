import React, { Component } from 'react';
import Service from './Service';

const service = new Service();

class ServiceList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            services: [],
            nextPageURL: '',
            prevPageURL: '',
        };
        this.nextPage = this.nextPage.bind(this);
        this.prevPage = this.prevPage.bind(this);
        // this.handleDelete = this.handleDelete.bind(this);
    }

    componentDidMount() {
        var self = this;
        service.getServices().then(function (result) {
            self.setState({services: result.features, nextPageURL: result.next, prevPageURL: result.prev})
        });
    }

    nextPage(){
        var self = this;
        service.getServiceByURL(this.state.nextPageURL).then((result) => {
            self.setState({services: result.features, nextPageURL: result.next, prevPageURL: result.prev})
        });
    }
    
    prevPage(){
        var self = this;
        service.getServiceByURL(this.state.nextPageURL).then((result) => {
            self.setState({services: result.features, nextPageURL: result.next, prevPageURL: result.prev})
        });
    }

    render() {
        return (
            <div className="card border-dark mb-3">
                <div className="card-body">
                    <div className="card-title">
                        {this.state.services.map( s =>
                           <h3>{s.title}</h3> 
                        )}
                    </div>
                </div>
            </div>
        )

    }

}
export default ServiceList;