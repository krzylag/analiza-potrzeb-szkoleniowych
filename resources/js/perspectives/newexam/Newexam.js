import React, { Component } from 'react';
import Cookie from 'js-cookie';
import moment from 'moment';
import PleaseWait from '../../components/PleaseWait';
import Axios from 'axios';
import CardExam from './CardExam';
import CardExaminers from './CardExaminers';
import CardExaminee from './CardExaminee';

const COOKIE_NAME = 'saved_exam';

export default class Newexam extends Component {

    constructor(props) {
        super(props);
        this.state = {
            schemasList: null,
            usersList: null,

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
        this.pullSchemasList();
        this.pullUsersList();
    }

    pullSchemasList() {
        Axios.get("/api/schema/list").then((response)=>{
            this.setState({schemasList: response.data}, ()=>{
                this.tryToRestore();
            });
        }).catch((error)=>{
            console.error(error);
        });
    }

    pullUsersList() {
        Axios.get("/api/user/list").then((response)=>{
            this.setState({usersList: response.data}, ()=>{
                this.tryToRestore();
            });
        }).catch((error)=>{
            console.error(error);
        });
    }

    tryToRestore() {
        if (this.state.schemasList!==null && this.state.usersList!==null && this.triedToRestore===false
            && this.state.firstname==='' && this.state.surname==='' && this.state.city==='') {
            this.restoreFromCookie();
            this.triedToRestore = true;
        }
    }

    render() {

        if (this.state.schemasList===null || this.state.usersList===null) {
            return <PleaseWait />
        }

        console.log({
            s: this.state.schemasList,
            u: this.state.usersList
        })

        return (
            <div className="Newexam">
                <h3>Rozpoczynasz nowy egzamin</h3>
                <form>
                    <CardExam
                        schemasList={this.state.schemasList}
                        date={this.state.date}
                        city={this.state.city}
                        schemaOptionSelected={this.state.schemaOptionSelected}
                        onDateChangedCallback={this.onDateChanged}
                        onCityChangedCallback={this.onCityChanged}
                        onSchemaOptionSelectedCallback={this.onSchemaOptionSelected}
                        onSchemaSelectedCallback={this.onSchemaSelected}
                    />
                    <CardExaminers
                        schemasList={this.state.schemasList}
                        usersList={this.state.usersList}
                        schemaOptionSelected={this.state.schemaOptionSelected}
                        onExaminerChangedCallback={this.onExaminerChanged}
                        examinersOptionsSelected={this.state.examinersOptionsSelected}
                    />
                    <CardExaminee
                        firstname={this.state.firstname}
                        surname={this.state.surname}
                        workplace={this.state.workplace}
                        onFirstnameChangedCallback={this.onFirstnameChanged}
                        onSurnameChangedCallback={this.onSurnameChanged}
                        onWorkplaceChangedCallback={this.onWorkplaceChanged}
                    />
                    <div className="text-center p-5">
                        <button type="button" className="btn btn-primary btn-lg" disabled={!this.isFormComplete} onClick={this.onStartClicked}>Start</button>
                    </div>
                </form>
            </div>
        );
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
        for(var cKey in this.state.schemasList[schemaId].competences) {
            var competence = this.state.schemasList[schemaId].competences[cKey];
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
        Axios.post("/api/exam/new", payload).then((response) => {
            this.saveToCookie();
            document.location=document.location.origin+"/assessment";
        })
    }

    getFormPayload() {
        var schemaId = (this.state.schemaOptionSelected!==null && typeof(this.state.schemaOptionSelected.value)!=='undefined' && !isNaN(parseInt(this.state.schemaOptionSelected.value))) ? parseInt(this.state.schemaOptionSelected.value) : null;
        var examinersByCompetence = {};
        if (schemaId!==null) {
            for (var compKey in this.state.schemasList[schemaId].competences) {
                var competence = this.state.schemasList[schemaId].competences[compKey];
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
            chairmanId: this.props.user.id
        };
    }

    saveToCookie() {
        Cookie.set(COOKIE_NAME, JSON.stringify(this.getFormPayload()));
    }

    restoreFromCookie() {
        var fromCookie = Cookie.get(COOKIE_NAME);
        if (typeof(fromCookie)!=='undefined' && this.props.user!==null && this.state.schemasList!==null && this.state.usersList!==null) {
            var payload = JSON.parse(fromCookie);
            var examinersOptions = [];
            for (var cKey in payload.examiners) {
                var cId = parseInt(cKey);
                examinersOptions[cId] = [];
                for(var e in payload.examiners[cKey]) {
                    var eId = parseInt(payload.examiners[cKey][e]);
                    examinersOptions[cId][eId] = {
                        value: eId,
                        label: this.state.usersList[eId].surname+" "+this.state.usersList[eId].firstname
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
                    label: this.state.schemasList[schemaId].shortname+" ("+moment(this.state.schemasList[schemaId].created_at).format('YYYY-MM-DD')+")"
                },
                examinersOptionsSelected: examinersOptions,
                startIsEnabled: false
            }, ()=>{
                console.log(this.state);
            })
        }
    }
}
