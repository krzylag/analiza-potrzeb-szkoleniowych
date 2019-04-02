import React, { Component } from 'react';
import Axios from 'axios';
import { Link } from 'react-router-dom';


export default class Examinfo extends Component {

    constructor(props) {
        super(props);
        this.state = {
            computedTime: []
        }
        this.clickedFinalizeExam = this.clickedFinalizeExam.bind(this);
        this.clickedPrevievProtocol = this.clickedPrevievProtocol.bind(this);
    }

    render() {
        var renderedCompetences = [];
        for (var ckey in this.props.exam.competences) {
            var competence = this.props.exam.competences[ckey];
            var allowedUsers = JSON.parse(competence.pivot.allowed_users);
            var canScore = (allowedUsers.indexOf(this.props.dictionary.user.id) >= 0);

            var renderedStatsByUser = [];
            for (var uid in this.props.statistics[competence.id]) {
                var examiner = this.props.dictionary.examiners[uid];
                var allTasks = this.props.statistics[competence.id][uid].all_count;
                var usedTasks = this.props.statistics[competence.id][uid].accepted_count;
                var avgScore = (usedTasks>0) ? this.props.statistics[competence.id][uid].accepted_sum/usedTasks : 0;
                renderedStatsByUser.push(
                    <div key={uid}>{examiner.firstname} {examiner.lastname}: <strong>{Math.ceil(avgScore*10000)/100} %</strong> ({usedTasks} / {allTasks})</div>
                )
            }
            if (canScore) {
                renderedCompetences.push(
                    <div key={competence.id} className="row pl-4" >
                        <div className="col-sm p-1">
                            {competence.name}
                        </div>
                        <div className="col-sm p-1">
                            <Link to={"/assessment/"+this.props.exam.id+"/"+competence.id} className="btn btn-sm btn-outline-primary">Oceniaj</Link>
                        </div>
                        <div className="col-sm p-1">
                            {renderedStatsByUser}
                        </div>
                    </div>
                );
            }
        }
        return (
            <div className="Examinfo card mt-5" id={"exam"+this.props.exam.id}>
                <h5 className="card-header">{this.props.exam.firstname} {this.props.exam.surname}</h5>
                <div className="card-body">
                    <table className="table table-sm table-bordered">
                        <tbody>
                            <tr>
                                <td>Egzaminowany:</td>
                                <td>{this.props.exam.firstname} {this.props.exam.surname} {this.props.exam.workplace}</td>
                            </tr>
                            <tr>
                                <td>Schemat:</td>
                                <td>{this.props.exam.schema.fullname}</td>
                            </tr>
                            <tr>
                                <td>Miejscowość, data:</td>
                                <td>{this.props.exam.city}, {this.props.exam.date}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="card-body">
                    <div className="container">
                        {renderedCompetences}
                    </div>
                </div>
                {(this.props.exam.created_by===this.props.dictionary.user.id) && (
                     <div className="card-body">
                        <div className="row pl-4" >
                            <div className="col-sm p-1">
                                <button type="button" className="btn btn-outline-success" onClick={this.clickedPrevievProtocol}>Podglądnij roboczy raport</button>
                            </div>
                            <div className="col-sm p-1">
                                <button type="button" className="btn btn-danger" onClick={this.clickedFinalizeExam}>Zakończ proces ewaluacji</button>
                                <div>
                                    <small>Po zakończeniu nie ma możliwości zmiany ocen ani komentarzy ocen. Będziesz mógł jedynie edytować ogólny komentarz do egzaminu.</small>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    clickedFinalizeExam() {
        if (confirm("Czy na pewno zakończyć egzamin dla "+this.props.exam.surname+" "+this.props.exam.firstname+"?")) {
            console.log("finalize");
            Axios.post('/api2/exam/finalize', {
                examId: this.props.exam.id
            }).then((response)=>{
                this.props.onExamFinalizedCallback(response.data);
            })
        }
    }

    clickedPrevievProtocol() {

    }

}
