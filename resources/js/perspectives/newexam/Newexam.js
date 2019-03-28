import React, { Component } from 'react';
import Select from 'react-select';
import Examinerselect from './Examinerselect';

export default class Newexam extends Component {

    constructor(props) {
        super(props);
        this.state = {
            firstname: '',
            surname: '',
            workplace:  '',
            city: '',
            date: '',
            schemaOptions: [
                { value: 1, label: "Jeden" },
                { value: 2, label: "Dwa" },
                { value: 3, label: "Trzy" },
            ],
            trainersOptions: [
                { value: 1, label: "Janek" },
                { value: 2, label: "Kazik" },
                { value: 3, label: "Zbysiu" },
            ],
            schemaOptionSelected: null,
            examinersOptionsSelected: []
        }
        this.onSchemaSelected = this.onSchemaSelected.bind(this);
        this.onExaminerChanged = this.onExaminerChanged.bind(this);
    }

    render() {
        console.log(this.props.dictionary);

        if (this.props.dictionary.schemas===null) {
            return 'Brak łączności z serwerem.';
        }

        var schemaOptions = [];
        for (var key in this.props.dictionary.schemas) {
            schemaOptions.push({
                value: this.props.dictionary.schemas[key].id,
                label: this.props.dictionary.schemas[key].shortname
            });
        }



        return (
            <div className="Newexam">
                <h3>Rozpoczynasz nowy egzamin</h3>
                <form>
                    {this.renderCardSchema()}
                    {this.state.schemaOptionSelected!==null && this.renderCardExaminers()}
                    {this.renderCardExaminee()}
                </form>
            </div>
        );
    }

    renderCardExaminee() {
        return (
            <div className="card mt-4">
                <h5 className="card-header">Dane osobowe egzaminowanego:</h5>
                <div className="card-body">
                    <div className="form-row">
                        <div className="form-group col-md-6">
                            <label htmlFor="inputFirstname">Imię</label>
                            <input type="text" className="form-control" id="inputFirstname" placeholder="imię" />
                        </div>
                        <div className="form-group col-md-6">
                            <label htmlFor="inputLastname">Nazwisko</label>
                            <input type="text" className="form-control" id="inputLastname" placeholder="nazwisko" />
                        </div>
                    </div>
                    <div className="form-row">
                        <label htmlFor="inputLastname">Miejsce pracy (dealer)</label>
                        <input type="text" className="form-control" id="inputWorkplace" placeholder="dealer" />
                    </div>
                </div>
            </div>
        );
    }

    renderCardSchema() {
        var schemaOptions = [];
        for (var key in this.props.dictionary.schemas) {
            schemaOptions.push({
                value: this.props.dictionary.schemas[key].id,
                label: this.props.dictionary.schemas[key].shortname
            });
        }
        return (
            <div className="card mt-4">
                <h5 className="card-header">Egzamin:</h5>
                <div className="card-body">
                    <div className="form-row">
                        <div className="form-group col-md-6">
                            <label htmlFor="inputCity">Miejscowość</label>
                            <input type="text" className="form-control" id="inputCity" placeholder="miejscowość" />
                        </div>
                        <div className="form-group col-md-6">
                            <label htmlFor="inputDate">Data</label>
                            <input type="date" className="form-control" id="inputDate" placeholder="data" />
                        </div>
                    </div>
                    <div className="form-row ">
                        <div className="form-group col-md-6">
                            <label htmlFor="inputCity">Wybierz schemat egzaminu:</label>
                            <Select
                                value={this.state.schemaOptionSelected}
                                options={schemaOptions}
                                onChange={this.onSchemaSelected}
                            />
                        </div>
                    </div>
                    <small>Miejscowość i data egzaminu pojawią się na protokole końcowym.</small>
                </div>
            </div>
        );
    }

    renderCardExaminers() {
        if (this.state.schemaOptionSelected===null) {
            return '';
        }
        var renderAttachExaminers = [];
        if (this.state.schemaOptionSelected!==null && this.props.dictionary.schemas[this.state.schemaOptionSelected.value]!==null) {
            var schema = this.props.dictionary.schemas[this.state.schemaOptionSelected.value];
            for (var cKey in schema.competences) {
                var competence = schema.competences[cKey];
                var thisExaminerOptionsSelected = (typeof(this.state.examinersOptionsSelected[competence.id])!=='undefined') ? this.state.examinersOptionsSelected[competence.id] : [];
                renderAttachExaminers.push(
                    <Examinerselect
                        key={competence.id}
                        dictionary={this.props.dictionary}
                        competence={competence}
                        selected={thisExaminerOptionsSelected}
                        onExaminerChangedCallback={this.onExaminerChanged}
                    />
                );
            }
        }
        var renderAttachExaminersContainer;
        if(renderAttachExaminers.length>0) {
            renderAttachExaminersContainer = (
                <div className="card mt-4">
                        <h5 className="card-header">Egzaminatorzy:</h5>
                        <div className="card-body">
                            {renderAttachExaminers}
                            <small>
                                Pola wielokrotnego wyboru. Możesz wybrać więcej niż jednego egzaminatora do każdej kompetencji.
                                To pole steruje wyłącznie widocznością egzaminu dla poszczególnych osób. Jeśli jakiś egzaminator nie przyzna ocen,
                                to nie obniży to końcowej średniej.
                            </small>
                        </div>
                </div>
            );
        }
        return renderAttachExaminersContainer;
    }

    onSchemaSelected(sel) {
        this.setState({schemaOptionSelected: sel});

    }

    onExaminerChanged(competence, values) {
        var examinersOptionsSelected=this.state.examinersOptionsSelected;
        examinersOptionsSelected[competence.id]=values;
        this.setState({examinersOptionsSelected});
    }

}
