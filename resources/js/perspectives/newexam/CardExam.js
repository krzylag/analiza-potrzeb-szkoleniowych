import React, { Component } from 'react';
import Select from 'react-select';
import moment from 'moment';

export default class CardExam extends Component {

    render() {

        var schemaOptions = [];
        for (var skey in this.props.schemasList) {
            schemaOptions.push({
                value: this.props.schemasList[skey].id,
                label: this.props.schemasList[skey].shortname+" ("+moment(this.props.schemasList[skey].created_at).format('YYYY-MM-DD')+")"
            });
        }

        return (
            <div className="CardExam card mt-4">
                <h5 className="card-header">Egzamin:</h5>
                <div className="card-body">
                    <div className="form-row">
                        <div className="form-group col-md-6">
                            <label htmlFor="inputCity">Miejscowość</label>
                            <input type="text" className="form-control" id="inputCity" placeholder="miejscowość" value={this.props.city} onChange={this.props.onCityChangedCallback} />
                        </div>
                        <div className="form-group col-md-6">
                            <label htmlFor="inputDate">Data</label>
                            <input type="date" className="form-control" id="inputDate" placeholder="data" value={this.props.date} onChange={this.props.onDateChangedCallback} />
                        </div>
                    </div>
                    <div className="form-row ">
                        <div className="form-group col-md-6">
                            <label htmlFor="inputCity">Wybierz schemat egzaminu:</label>
                            <Select
                                value={this.props.schemaOptionSelected}
                                options={schemaOptions}
                                onChange={this.props.onSchemaSelectedCallback}
                            />
                        </div>
                    </div>
                    <small>Miejscowość i data egzaminu pojawią się na protokole końcowym.</small>
                </div>
            </div>
        );
    }

}
