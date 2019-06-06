import React, { Component } from 'react';
import ExamCardCompetences from './ExamCardCompetences';
import Axios from 'axios';
import { Link } from 'react-router-dom';
import ExamCardReport from './ExamCardReport';


export default class ExamCard extends Component {

    constructor(props) {
        super(props);
        this.clickedFinalizeExam = this.clickedFinalizeExam.bind(this);
    }

    render() {
        console.log(this.props);

        return (
            <div className="ExamCard card mt-5" id={"exam"+this.props.exam.id}>
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
                <ExamCardCompetences
                    exam={this.props.exam}
                    schema={this.props.schema}
                    statistics={this.props.statistics}
                    users={this.props.users}
                />
                <ExamCardReport
                    exam={this.props.exam}
                    schema={this.props.schema}
                    statistics={this.props.statistics}
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
            Axios.post('/api2/exam/finalize', {
                examId: this.props.exam.id
            }).then((response)=>{
                this.props.onExamFinalizedCallback(response.data);
            })
        }
    }

}
