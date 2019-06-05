import React, { Component } from 'react';
import Axios from 'axios';
import { Link } from 'react-router-dom';


export default class Examinfo extends Component {

    constructor(props) {
        super(props);
        this.clickedFinalizeExam = this.clickedFinalizeExam.bind(this);
    }

    render() {
        console.log(this.props);

        var renderedCompetences = [];
        for (var ckey in this.props.schema.competences) {
            var competence = this.props.schema.competences[ckey];
            var canScore = this.props.exam.allowed_competences[competence.id];

            var renderedStatsByUser = [];

            // for (var uid in this.props.statistics[competence.id]) {
            //     var examiner = this.props.dictionary.examiners[uid];
            //     var allTasks = this.props.statistics[competence.id][uid].all_count;
            //     var usedTasks = this.props.statistics[competence.id][uid].accepted_count;
            //     var avgScore = (usedTasks>0) ? this.props.statistics[competence.id][uid].accepted_sum/usedTasks : 0;
            //     if (this.props.statistics[competence.id][uid].accepted_sum > 0) {
            //         renderedStatsByUser.push(
            //             <div key={uid}>{examiner.firstname.substring(0,1)}. {examiner.surname}: <strong>{Math.ceil(avgScore*10000)/100} %</strong> ({usedTasks} / {allTasks})</div>
            //         )
            //     }
            // }
            renderedCompetences.push(
                <div key={competence.id} className="row pl-4 border-top" >
                    <div className="col-sm p-1">
                        {competence.name}
                    </div>
                    <div className="col-sm p-1">
                        {canScore &&
                            <Link to={"/assessment/"+this.props.exam.id+"/"+competence.id} className="btn btn-sm btn-outline-primary">Oceniaj</Link>
                        }
                    </div>
                    <div className="col-sm p-1">
                        {renderedStatsByUser}
                    </div>
                </div>
            );
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
                                <td>{this.props.schema.fullname}</td>
                            </tr>
                            <tr>
                                <td>Miejscowość, data:</td>
                                <td>{this.props.exam.city}, {this.props.exam.date}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="card-body">
                    <div className="container border-bottom">
                        {renderedCompetences}
                    </div>
                </div>
                {(this.props.exam.created_by===this.props.user.id) && (
                     <div className="card-body">
                        <div className="row pl-4" >
                            <div className="col-sm p-1">
                                <Link className="btn btn-outline-primary" to={"/assessment/comment/edit/"+this.props.exam.id}>
                                    Raport wstępny<br />/ edycja feedbacku
                                </Link>
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

}
