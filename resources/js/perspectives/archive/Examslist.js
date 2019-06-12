import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import Axios from 'axios';
import { formatScore } from '../../helpers/Formatters';
import { OVERRIDE_ACCEPTED, OVERRIDE_NOEFFECT, OVERRIDE_HIDDEN } from '../assessment/ExamCardOverrideEditor';

import view from '../../images/view.png';
import edit from '../../images/edit.png';
import pdf from '../../images/pdf.png';
import revert from '../../images/revert.png';

export default class Examslist extends Component {

    constructor(props) {
        super(props);
        this.onRevertClicked = this.onRevertClicked.bind(this);
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
        return (
            <tr key={exam.id}>
                <td>{exam.date}</td>
                <td>{exam.schema.shortname}</td>
                <td>{exam.surname} {exam.firstname}</td>
                <td>{this.renderExamResult(exam)}</td>
                <td>{this.renderExamButtons(exam)}</td>
            </tr>
        );
    }

    renderExamResult(exam) {

        var renderedTrainings = [];
        for(var tkey in exam.results) {
            var training = exam.results[tkey];

            var scoringClass = '';
            if (training.override) {
                if (training.override_id===OVERRIDE_ACCEPTED) {
                    scoringClass = ' text-success';
                } else if (training.override_id===OVERRIDE_NOEFFECT) {
                    scoringClass = ' text-primary';
                } else if (training.override_id===OVERRIDE_HIDDEN) {
                    scoringClass = ' text-muted';
                }
            } else if (!training.override && training.passed) {
                scoringClass = ' text-success';
            } else {
                scoringClass = ' text-danger';
            }

            if (!training.override || training.override_id!=OVERRIDE_HIDDEN) {
                renderedTrainings.push(
                    <div key={tkey} className={"d-flex flex-row justify-content-start align-items-center"+scoringClass}>
                        <div><strong>{formatScore(training.avg)}</strong></div>
                        <div className="ml-3">{training.shortname}</div>
                    </div>
                );
            }
        }
        return (
            <div>
                {renderedTrainings}
            </div>
        )
    }

    renderExamButtons(exam) {
        var canEditComment = (this.props.user.id===exam.created_by || this.props.user.capabilities.is_admin);
        var finishedDaysAgo = (moment.duration((new moment()).diff((new moment(exam.updated_at))))).get("days");
        var canRevertCompletion = ((this.props.user.id===exam.created_by && finishedDaysAgo===0) || this.props.user.capabilities.is_admin);

        return (
            <div>
                {canEditComment &&
                    <Link className="btn btn-sm" alt="Edytuj komentarz" to={"/archive/comment/edit/"+exam.id}>
                        <img className="button-image" src={edit} />
                    </Link>
                }
                <a className="btn btn-sm" href={`/archive/exam/${exam.id}/long/html`} target="_blank"><img className="button-image" src={view} /></a>
                <a className="btn btn-sm" href={`/archive/exam/${exam.id}/short/pdf`} target="_blank"><img className="button-image" src={pdf} /></a>
                {canRevertCompletion &&
                    <button type="button" className="btn  btn-sm btn-danger" onClick={(ev) => (this.onRevertClicked(ev, exam.id))}>
                        <img className="button-image" src={revert} />
                    </button>
                }
            </div>
        )
    }


    onRevertClicked(ev, eid) {
        if (confirm("Czy na pewno przywrócić egzamin do edycji?")) {
            Axios.post(`/api/exam/${eid}/revert`, {
                examId: eid
            }).then((response)=>{
                this.props.onExamRevertedCallback(response.data);
            })
        }
    }
}
