import React, { Component } from 'react';

export default class CardExaminee extends Component {

    render() {


        return (
            <div className="CardExaminee card mt-4">
                <h5 className="card-header">Dane osobowe egzaminowanego:</h5>
                <div className="card-body">
                    <div className="form-row">
                        <div className="form-group col-md-6">
                            <label htmlFor="inputFirstname">Imię</label>
                            <input type="text" className="form-control" id="inputFirstname" placeholder="imię" value={this.props.firstname} onChange={this.props.onFirstnameChangedCallback} />
                        </div>
                        <div className="form-group col-md-6">
                            <label htmlFor="inputLastname">Nazwisko</label>
                            <input type="text" className="form-control" id="inputLastname" placeholder="nazwisko" value={this.props.surname} onChange={this.props.onSurnameChangedCallback} />
                        </div>
                    </div>
                    <div className="form-row">
                        <label htmlFor="inputLastname">Miejsce pracy (dealer)</label>
                        <input type="text" className="form-control" id="inputWorkplace" placeholder="dealer" value={this.props.workplace} onChange={this.props.onWorkplaceChangedCallback} />
                    </div>
                </div>
            </div>
        );
    }

}
