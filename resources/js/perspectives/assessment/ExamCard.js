import React, { Component } from 'react';
import ExamCardCompetences from './ExamCardCompetences';
import Axios from 'axios';
import { Link } from 'react-router-dom';
import ExamCardReport from './ExamCardReport';
import { resolveUserNames } from '../../helpers/Formatters';
import PleaseWait from '../../components/PleaseWait';


export default class ExamCard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            examFinishAwaiting: false
        }
        this.clickedFinalizeExam = this.clickedFinalizeExam.bind(this);
        this.toggleExpand = this.toggleExpand.bind(this);
    }

    render() {
        var userIsChairman = (this.props.user.id===this.props.exam.created_by);

        var canExamBeFinalized = this._canExamBeFinalized();

        var examCardClasses = 'ExamCard card mt-5';
        if (this.props.isExpanded) {
            examCardClasses += ' is-expanded';
        } else {
            examCardClasses += ' is-contracted';
        }
        var examiners = [];
        for (var eid in this.props.exam.exam_members) {
            examiners.push(resolveUserNames(this.props.exam.exam_members[eid], this.props.users))
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
                            <tr>
                                <th>przewodniczący:</th>
                                <td>{resolveUserNames(this.props.exam.created_by, this.props.users)}</td>
                            </tr>
                            <tr>
                                <th>egzaminatorzy:</th>
                                <td>{examiners.join(", ")}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {this.props.isExpanded &&
                    <ExamCardCompetences
                        exam={this.props.exam}
                        schema={this.props.schema}
                        statistics={this.props.statistics}
                        users={this.props.users}
                        userIsChairman={userIsChairman}
                        requestExamRefreshCallback={this.props.requestExamRefreshCallback}
                    />
                }
                {this.props.isExpanded && userIsChairman &&
                    <ExamCardReport
                        exam={this.props.exam}
                        schema={this.props.schema}
                        statistics={this.props.statistics}
                        requestExamRefreshCallback={this.props.requestExamRefreshCallback}
                    />
                }
                {this.props.isExpanded && userIsChairman &&
                     <div className="card-body">
                        <div className="row pl-4 text-center" >
                            <div className="col-sm p-1">
                                <Link className="btn btn-outline-primary" to={"/assessment/comment/edit/"+this.props.exam.id}>
                                    Raport wstępny<br />/ edycja feedbacku
                                </Link>
                            </div>
                            <div className="col-sm p-1">
                                {canExamBeFinalized && !this.state.examFinishAwaiting &&
                                    <button type="button" className="btn btn-danger" onClick={this.clickedFinalizeExam}>Zakończ proces ewaluacji</button>
                                }
                                {canExamBeFinalized && this.state.examFinishAwaiting &&
                                    <PleaseWait suffix={null} />
                                }
                                {canExamBeFinalized &&
                                    <div>
                                        <small>Po zakończeniu nie ma możliwości zmiany ocen ani komentarzy ocen. Będziesz mógł jedynie edytować ogólny komentarz do egzaminu.</small>
                                    </div>
                                }
                                {!canExamBeFinalized &&
                                    <div className="text-danger">
                                        Nie ma możliwości zakończenia egzaminu,<br />ponieważ zadania nie są ocenione do końca!
                                    </div>
                                }
                            </div>
                            <div className="col-sm p-1">
                                <button type="button" className="btn btn-outline-primary btn-special-refresh" onClick={this.props.requestExamRefreshCallback}>
                                    <img src="/images/refresh.svg"/>
                                </button>
                            </div>
                        </div>
                    </div>
                }
            </div>
        );
    }

    clickedFinalizeExam() {
        this.setState({examFinishAwaiting:true}, ()=>{
            this.props.requestExamRefreshCallback(()=>{
                if (this._canExamBeFinalized() && confirm("Czy na pewno zakończyć egzamin dla "+this.props.exam.surname+" "+this.props.exam.firstname+"?")) {
                    Axios.post(`/api/exam/${this.props.exam.id}/finalize`, {
                        examId: this.props.exam.id
                    }).then((response)=>{
                        this.setState({examFinishAwaiting:false},()=>{
                            this.props.requestExamRefreshCallback();
                        });
                    }).catch((error)=>{
                        console.error(error);
                    });
                } else {
                    this.setState({examFinishAwaiting:false});
                }
            });
        })
    }

    toggleExpand() {
        this.props.requestExamExpandCallback(this.props.exam);
    }

    _canExamBeFinalized() {
        var result = true;
        for(var tId in this.props.statistics.tasks) {
            var task = this.props.statistics.tasks[tId];
            if (task.accepted && task.count<task.count_max) {
                result=false;
                break;
            }
        }
        return result;
    }
}
