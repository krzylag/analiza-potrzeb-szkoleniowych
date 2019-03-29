import React, { Component } from 'react';
import Select from 'react-select';
import Cookie from 'js-cookie';
import Examinerselect from './Examinerselect';
import Axios from 'axios';

const COOKIE_NAME = 'saved_exam';

export default class Newexam extends Component {

    constructor(props) {
        super(props);
        this.state = {
            firstname: '',
            surname: '',
            workplace:  '',
            city: '',
            date: '',
            schemaOptionSelected: null,
            examinersOptionsSelected: [],
            startIsEnabled: false,
            isSending: false
        }
        this.onSchemaSelected = this.onSchemaSelected.bind(this);
        this.onExaminerChanged = this.onExaminerChanged.bind(this);
        this.onWorkplaceChanged = this.onWorkplaceChanged.bind(this);
        this.onSurnameChanged = this.onSurnameChanged.bind(this);
        this.onFirstnameChanged = this.onFirstnameChanged.bind(this);
        this.onCityChanged = this.onCityChanged.bind(this);
        this.onDateChanged = this.onDateChanged.bind(this);
        this.onStartClicked = this.onStartClicked.bind(this);

        this.triedToRestore = false;
    }

    componentDidMount() {
        if (this.triedToRestore===false
            && this.state.firstname==='' && this.state.surname==='' && this.state.city===''
            && this.props.dictionary.user!==null && this.props.dictionary.schemas!==null && this.props.dictionary.examiners!==null) {
            this.restoreFromCookie();
            this.triedToRestore = true;
        }
    }

    render() {

        //console.log(this.props.dictionary);

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
                    <div className="text-center p-5">
                        <button type="button" className="btn btn-primary btn-lg" disabled={!this.state.startIsEnabled} onClick={this.onStartClicked}>Start</button>
                    </div>
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
                            <input type="text" className="form-control" id="inputFirstname" placeholder="imię" value={this.state.firstname} onChange={this.onFirstnameChanged} />
                        </div>
                        <div className="form-group col-md-6">
                            <label htmlFor="inputLastname">Nazwisko</label>
                            <input type="text" className="form-control" id="inputLastname" placeholder="nazwisko" value={this.state.surname} onChange={this.onSurnameChanged} />
                        </div>
                    </div>
                    <div className="form-row">
                        <label htmlFor="inputLastname">Miejsce pracy (dealer)</label>
                        <input type="text" className="form-control" id="inputWorkplace" placeholder="dealer" value={this.state.workplace} onChange={this.onWorkplaceChanged} />
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
                            <input type="text" className="form-control" id="inputCity" placeholder="miejscowość" value={this.state.city} onChange={this.onCityChanged} />
                        </div>
                        <div className="form-group col-md-6">
                            <label htmlFor="inputDate">Data</label>
                            <input type="date" className="form-control" id="inputDate" placeholder="data" value={this.state.date} onChange={this.onDateChanged} />
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
                                To pole steruje wyłącznie widocznością egzaminu dla poszczególnych osób. Jeśli jakiś egzaminator w ogóle nie przyzna ocen,
                                to nie wpłynie na końcową średnią uczestnika.
                            </small>
                        </div>
                </div>
            );
        }
        return renderAttachExaminersContainer;
    }

    onFirstnameChanged(ev) {
        this.setState({firstname: ev.target.value, startIsEnabled: this.isFormComplete()});
    }

    onSurnameChanged(ev) {
        this.setState({surname: ev.target.value, startIsEnabled: this.isFormComplete()});
    }

    onWorkplaceChanged(ev) {
        this.setState({workplace: ev.target.value, startIsEnabled: this.isFormComplete()});
    }

    onCityChanged(ev) {
        this.setState({city: ev.target.value, startIsEnabled: this.isFormComplete()});
    }

    onDateChanged(ev) {
        this.setState({date: ev.target.value, startIsEnabled: this.isFormComplete()});
    }

    onSchemaSelected(sel) {
        this.setState({schemaOptionSelected: sel, startIsEnabled: this.isFormComplete()});

    }

    onExaminerChanged(competence, values) {
        var examinersOptionsSelected=this.state.examinersOptionsSelected;
        examinersOptionsSelected[competence.id]=values;
        this.setState({examinersOptionsSelected});
    }

    isFormComplete() {
        var schemaId = (this.state.schemaOptionSelected!==null && typeof(this.state.schemaOptionSelected.value)!=='undefined' && !isNaN(parseInt(this.state.schemaOptionSelected.value))) ? parseInt(this.state.schemaOptionSelected.value) : null;
        if (schemaId===null) return false;
        var allCompetencesPlanted = true;
        for(var cKey in this.props.dictionary.schemas[schemaId].competences) {
            var competence = this.props.dictionary.schemas[schemaId].competences[cKey];
            if (typeof(this.state.examinersOptionsSelected[competence.id])==='undefined' || this.state.examinersOptionsSelected[competence.id]===null) {
                allCompetencesPlanted=false;
                break;
            }
        }
        if (!allCompetencesPlanted) return false;
        return (
            this.state.firstname!==null && this.state.firstname.trim()!==''
            && this.state.surname!==null && this.state.surname.trim()!==''
            && this.state.city!==null && this.state.city.trim()!==''
            && this.state.date!==null && this.state.date!==''
        );
    }

    onStartClicked() {
        var payload = this.getFormPayload();
        this.setState({isSending: true});
        Axios.post("/api2/exam/new", payload).then((response) => {
            //console.log(response.data);
            this.saveToCookie();
            document.location=document.location.origin+"/assessment";
        })
        //console.log(payload);
    }

    getFormPayload() {
        var schemaId = (this.state.schemaOptionSelected!==null && typeof(this.state.schemaOptionSelected.value)!=='undefined' && !isNaN(parseInt(this.state.schemaOptionSelected.value))) ? parseInt(this.state.schemaOptionSelected.value) : null;
        var examinersByCompetence = {};
        if (schemaId!==null) {
            for (var compKey in this.props.dictionary.schemas[schemaId].competences) {
                var competence = this.props.dictionary.schemas[schemaId].competences[compKey];
                examinersByCompetence[competence.id] = [];
                for (var eKey in this.state.examinersOptionsSelected[competence.id]) {
                    examinersByCompetence[competence.id].push(this.state.examinersOptionsSelected[competence.id][eKey].value);
                }
            }
        }
        return {
            firstname: this.state.firstname.trim(),
            surname: this.state.surname.trim(),
            workplace: this.state.workplace.trim(),
            city: this.state.city.trim(),
            date: this.state.date,
            schemaId: schemaId,
            examiners : examinersByCompetence,
            chairmanId: this.props.dictionary.user.id
        };
    }

    saveToCookie() {
        Cookie.set(COOKIE_NAME, JSON.stringify(this.getFormPayload()));
    }

    restoreFromCookie() {
        var fromCookie = Cookie.get(COOKIE_NAME);
        if (typeof(fromCookie)!=='undefined' && this.props.dictionary.user!==null && this.props.dictionary.schemas!==null && this.props.dictionary.examiners!==null) {
            var payload = JSON.parse(fromCookie);
            var examinersOptions = [];
            for (var cKey in payload.examiners) {
                var cId = parseInt(cKey);
                examinersOptions[cId] = [];
                for(var e in payload.examiners[cKey]) {
                    var eId = parseInt(payload.examiners[cKey][e]);
                    examinersOptions[cId][eId] = {
                        value: eId,
                        label: this.props.dictionary.examiners[eId].surname+" "+this.props.dictionary.examiners[eId].firstname
                    }
                }
            }
            var schemaId = parseInt(payload.schemaId);
            this.setState({
                firstname: '',
                surname: '',
                workplace:  '',
                city: payload.city,
                date: payload.date,
                schemaOptionSelected: {
                    value: schemaId,
                    label: this.props.dictionary.schemas[schemaId].shortname
                },
                examinersOptionsSelected: examinersOptions,
                startIsEnabled: false
            })
        }
        //console.log(payload);
    }
}
