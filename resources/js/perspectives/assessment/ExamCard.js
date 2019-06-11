import React, { Component } from 'react';
import ExamCardCompetences from './ExamCardCompetences';
import Axios from 'axios';
import { Link } from 'react-router-dom';
import ExamCardReport from './ExamCardReport';


export default class ExamCard extends Component {

    constructor(props) {
        super(props);
        this.clickedFinalizeExam = this.clickedFinalizeExam.bind(this);
        this.toggleExpand = this.toggleExpand.bind(this);
    }

    render() {

        var examCardClasses = 'ExamCard card mt-5';
        if (this.props.isExpanded) {
            examCardClasses += ' is-expanded';
        } else {
            examCardClasses += ' is-contracted';
        }
        return (
            <div className={examCardClasses} id={"exam-"+this.props.exam.id}>
                <h5 className="card-header" onClick={this.toggleExpand}>{this.props.exam.firstname} {this.props.exam.surname}</h5>
                <div className="card-body" onClick={this.toggleExpand}>
                    <table className="table table-sm table-bordered">
                        <tbody>
                            <tr>
                                <th>egzaminowany:</th>
                                <td>{this.props.exam.firstname} {this.props.exam.surname} {this.props.exam.workplace}</td>
                            </tr>
                            <tr>
                                <th>schemat:</th>
                                <td>{this.props.schema.fullname}</td>
                            </tr>
                            <tr>
                                <th>miejscowość, data:</th>
                                <td>{this.props.exam.city}, {this.props.exam.date}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <ExamCardCompetences
                    exam={this.props.exam}
                    schema={this.props.schema}
                    statistics={this.props.statistics}
                    users={this.props.users}
                    requestExamRefreshCallback={this.props.requestExamRefreshCallback}
                />
                <ExamCardReport
                    exam={this.props.exam}
                    schema={this.props.schema}
                    statistics={this.props.statistics}
                    requestExamRefreshCallback={this.props.requestExamRefreshCallback}
                />
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
            Axios.post(`/api/exam/${this.props.exam.id}/finalize`, {
                examId: this.props.exam.id
            }).then((response)=>{
                this.props.onExamFinalizedCallback(response.data);
            })
        }
    }

    toggleExpand() {
        this.props.requestExamExpandCallback(this.props.exam);
    }

}
