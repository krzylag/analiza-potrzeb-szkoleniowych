import React, { Component } from 'react';
import Axios from 'axios';

export default class Settings extends Component {

    constructor(props) {
        super(props);
        this.state = {
            file: null
        }
        this.onFileSelected = this.onFileSelected.bind(this);
        this.onUploadClicked = this.onUploadClicked.bind(this);
    }

    render() {
        var renderedSchemas = [];
        for (var skey in this.props.dictionary.schemas) {
            var schema = this.props.dictionary.schemas[skey];
            renderedSchemas.push(this.renderSchema(schema));
        }
        var stringFilename = (this.state.file!==null) ? this.state.file.name : "Wybierz plik";
        return (
            <div className="Settings">
                <div className="card mt-4">
                    <h5 className="card-header">Istniejące schematy</h5>
                    <div className="card-body">
                        {renderedSchemas}
                    </div>
                </div>
                <div className="card mt-5">
                    <h5 className="card-header">Import</h5>
                    <div className="card-body">
                        <div className="input-group mb-3">
                            <div className="custom-file">
                                <input type="file" className="custom-file-input" id="inputGroupFile02" onChange={this.onFileSelected}/>
                                <label className="custom-file-label" htmlFor="inputGroupFile02" aria-describedby="inputGroupFileAddon02">{stringFilename}</label>
                            </div>
                        </div>
                        <button type="button" className="btn btn-outline-primary" onClick={this.onUploadClicked}>Wyślij</button>
                    </div>
                </div>
            </div>
        );
    }

    renderSchema(schema) {
        var renderedCompetences = [];
        for (var ckey in schema.competences) {
            var competence = schema.competences[ckey];
            renderedCompetences.push(
                <div key={competence.id} className="ml-2">
                    {competence.description} <small className="text-secondary">{competence.tasks.length} możliwych zadań</small>
                </div>
            )
        }
        return (
            <div key={schema.id} className="container mt-4 mb-4">
                <div className="row">
                    <div className="col-sm"><strong>{schema.fullname}</strong></div>
                    <div className="col-sm">Utworzony:</div>
                </div>
                <div className="row">
                    <div className="col-sm">{schema.shortname}</div>
                    <div className="col-sm">{schema.created_at}</div>
                </div>
                <div className="row">
                    <div className="col-sm"></div>
                    <div className="col-sm">{renderedCompetences}</div>
                </div>
            </div>
        );
    }

    onFileSelected(ev) {
        this.setState({file: ev.target.files[0]});
    }

    onUploadClicked() {
        var data = new FormData();
        data.append('uploaded', this.state.file, this.state.file.name);
        var settings = { headers: { 'content-type': 'multipart/form-data' } };
        Axios.post("/api2/schema/import", data, settings).then((response)=>{
            console.log(response.data);
        }).catch((error)=>{
            console.log(error.data);
        })
    }
}
