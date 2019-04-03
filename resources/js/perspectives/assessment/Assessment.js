import React, { Component } from 'react';
import Axios from 'axios';
import PleaseWait from '../../components/PleaseWait';
import Examinfo from './Examinfo';
import Competenceinfo from './Competenceinfo';
import Exam from './exam/Exam';
import Examcomment from './examcomment/Examcomment';

export default class Assessment extends Component {

    constructor(props) {
        super(props);
        this.state = {
            memberExams: null,
            examStatistics: null
        }
        this.onExamFinalized=this.onExamFinalized.bind(this);
    }

    componentDidMount() {
        Axios.get("/api2/exam/list-unfinished-for-member/"+this.props.dictionary.user.id).then((response) => {
            var memberExams = {};
            for(var ekey in response.data.exams) {
                var exam = response.data.exams[ekey];
                for (var ckey in exam.competences) {
                    exam.competences[ckey].tasks.sort(function(a,b) {
                        return a.order_signature > b.order_signature;
                    })
                }
                memberExams[exam.id] = exam;
            }
            var examStatistics = response.data.statistics;
            this.setState({memberExams, examStatistics});
        });
    }

    render() {
        if (this.state.memberExams===null || this.state.examStatistics===null) {
            return ( <PleaseWait /> );
        }

        // Jeśli examId, competenceId podane jako parametry - pokaż listę zadań
        if (this.props.params[0]!==null && this.props.params[1]!==null && this.props.params[2]===null
                && !isNaN(this.props.params[0]) && !isNaN(this.props.params[1])) {
            var exam = this.state.memberExams[this.props.params[0]];
            var competence = null;
            for (var cid in exam.competences) {
                if (exam.competences[cid].id===parseInt(this.props.params[1])) {
                    competence = exam.competences[cid];
                    break;
                }
            }
            competence.tasks.sort(function(a,b) {
                if (isNaN(a.order_signature)) return -1;
                if (isNaN(b.order_signature)) return 1;
                if (a.order_signature===b.order_signature)
                    return a.hash > b.hash;
                else
                    return parseInt(a.order_signature) > parseInt(b.order_signature);
            });
            var allowedUsers = JSON.parse(competence.pivot.allowed_users);
            var canScore = (allowedUsers.indexOf(this.props.dictionary.user.id) >= 0);
            return (
                <Competenceinfo
                    dictionary={this.props.dictionary}
                    exam={exam}
                    competence={competence}
                    canScore={canScore}
                />
            );
        }

        // Jeśli examId, competenceId, taskId podane jako parametry - pokaż ekran oceny
        if (this.props.params[0]!==null && this.props.params[1]!==null && this.props.params[2]!==null
                && !isNaN(this.props.params[0]) && !isNaN(this.props.params[1]) && !isNaN(this.props.params[2])) {
            var exam = this.state.memberExams[this.props.params[0]];
            var competence = null;
            for (var cid in exam.competences) {
                if (exam.competences[cid].id===parseInt(this.props.params[1])) {
                    competence = exam.competences[cid];
                    break;
                }
            }
            var task = null;
            for (var tid in competence.tasks) {
                if (competence.tasks[tid].id===parseInt(this.props.params[2])) {
                    task = competence.tasks[tid];
                    break;
                }
            }
            var allowedUsers = JSON.parse(competence.pivot.allowed_users);
            var canScore = (allowedUsers.indexOf(this.props.dictionary.user.id) >= 0);
            return (
                <Exam
                    exam={exam}
                    competence={competence}
                    task={task}
                    canScore={canScore}
                />
            );
        }

        // Jeśli statycznie wskazano .../comment/edit/{examId}, - pokaż ekran edycji komentarza
        if (this.props.params[0]!==null && this.props.params[1]!==null && this.props.params[2]!==null
            && this.props.params[0]==='comment' && this.props.params[1]==='edit' && !isNaN(this.props.params[2])) {
                return (
                    <Examcomment
                        examId={parseInt(this.props.params[2])}
                        dictionary={this.props.dictionary}
                    />
                );
        }

        // W innych przypadkach, pokaż listę egzaminów.
        var renderedExamsList = [];
        for (var key in this.state.memberExams) {
            var exam = this.state.memberExams[key];
            var statistics = this.state.examStatistics[key];
            renderedExamsList.push(
                <Examinfo
                    key={exam.id}
                    dictionary={this.props.dictionary}
                    exam={exam}
                    statistics={statistics}
                    onExamFinalizedCallback={this.onExamFinalized}
                />
            )
        }
        return (
            <div className="Assessment">
                {renderedExamsList}
            </div>
        );
    }

    onExamFinalized(exam) {
        var memberExams = this.state.memberExams;
        delete(memberExams[exam.id]);
        this.setState({memberExams});
    }
}
