import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import Axios from 'axios';

import view from '../../images/view.png';
import edit from '../../images/edit.png';
import pdf from '../../images/pdf.png';
import revert from '../../images/revert.png';

export default class Examslist extends Component {

    constructor(props) {
        super(props);
        this.onRevertClicked = this.onRevertClicked.bind(this);
       // this.onPdfClicked = this.onPdfClicked.bind(this);
        this.onViewClicked = this.onViewClicked.bind(this);
    }

    render() {
        var renderedExams = [];
        for (var key in this.props.exams) {
            var exam = this.props.exams[key];
            renderedExams.push(this.renderExam(exam));
        }
        return (
            <div className="Examslist">
                <table className="table table-sm">
                    <thead>
                        <tr>
                            <th>data</th>
                            <th>schemat</th>
                            <th>egzaminowany</th>
                            <th>wynik</th>
                            <th>czynności</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderedExams}
                    </tbody>
                </table>
            </div>
        );
    }

    renderExam(exam) {
        var createdAt = new moment(exam.created_at);
        return (
            <tr key={exam.id}>
                <td>{createdAt.format("YYYY-MM-DD")}</td>
                <td>{exam.schema.shortname}</td>
                <td>{exam.surname} {exam.firstname}</td>
                <td>{this.renderExamResult(exam)}</td>
                <td>{this.renderExamButtons(exam)}</td>
            </tr>
        );
    }

    renderExamResult(exam) {
        var renderedByCompetence = [];
        for(var ckey in exam.competences) {
            var competence = exam.competences[ckey];
            var result = exam.results[ckey];
            var scoringClass = (parseFloat(competence.score_threshold)<=result.avg) ? ' text-success' : ' text-danger';
            renderedByCompetence.push(
                <div key={competence.id} className={"d-flex flex-row justify-content-start align-items-center"+scoringClass}>
                    <div><strong>{Math.ceil(result.avg*10000)/100} / {Math.ceil(parseFloat(competence.score_threshold)*10000)/100} %</strong></div>
                    <div className="ml-3">{competence.name}</div>
                </div>
            )
        }
        return (
            <div>
                {renderedByCompetence}
            </div>
        )
    }

    renderExamButtons(exam) {
        var canEditComment = (this.props.dictionary.user.id===exam.created_by || this.props.dictionary.user.capabilities.is_admin);
        var finishedDaysAgo = (moment.duration((new moment()).diff((new moment(exam.updated_at))))).get("days");
        var canRevertCompletion = ((this.props.dictionary.user.id===exam.created_by && finishedDaysAgo===0) || this.props.dictionary.user.capabilities.is_admin);

        return (
            <div>
                {canEditComment &&
                    <Link className="btn " alt="Edytuj komentarz" to={"/assessment/comment/edit/"+exam.id}>
                        <img className="button-image" src={edit} />
                    </Link>
                }
                <a className="btn" href={"/api2/archive/preview/long/"+exam.id} target="_blank"><img className="button-image" src={view} /></a>
                <a className="btn" href={"/api2/archive/pdf/short/"+exam.id} target="_blank"><img className="button-image" src={pdf} /></a>
                {canRevertCompletion &&
                    <button type="button" className="btn btn-danger" onClick={(ev) => (this.onRevertClicked(ev, exam.id))}>
                        <img className="button-image" src={revert} />
                    </button>
                }
            </div>
        )
    }

    onViewClicked(ev, eid) {
        Axios.get('/api2/archive/report/full/'+eid).then((response)=>{
            console.log(response.data);
        });
    }


    onRevertClicked(ev, eid) {
        if (confirm("Czy na pewno przywrócić egzamin do edycji?")) {
            Axios.post('/api2/exam/revert', {
                examId: eid
            }).then((response)=>{
                this.props.onExamRevertedCallback(response.data);
            })
        }
    }
}
