import React, { Component } from 'react';
import Axios from 'axios';
import PleaseWait from '../../components/PleaseWait';
import ExamCard from './ExamCard';
import CompetenceCard from './CompetenceCard';
import Exam from './exam/Exam';
import Examcomment from './examcomment/Examcomment';

export default class Assessment extends Component {

    constructor(props) {
        super(props);
        this.state = {
            usersList: null,
            schemasList: null,
            examsList: null,
            statisticsList: null,
            selectedExamId: null
        }
        this.onExamFinalized=this.onExamFinalized.bind(this);
        this.pullUnfinishedExams=this.pullUnfinishedExams.bind(this);
        this.pullStatistics=this.pullStatistics.bind(this);
        this.expandExam=this.expandExam.bind(this);
    }

    componentDidMount() {
        this.pullUsersList();
        this.pullSchemasList();
        this.pullUnfinishedExams();
    }

    componentDidUpdate(prevProps) {
        if (this.props.perspective.id!==prevProps.perspective.id) {
            this.setState({
                schemasList: null,
                examsList: null,
                statisticsList: null
            }, ()=>{
                this.pullSchemasList();
                this.pullUnfinishedExams();
            });
        }
    }

    pullUsersList() {
        Axios.get("/api/user/list/with-deleted").then((response)=>{
            this.setState({usersList: response.data});
        }).catch((error)=>{
            console.error(error);
        });
    }

    pullSchemasList() {
        Axios.get('/api/schema/list/with-deleted').then((response)=>{
            this.setState({schemasList: response.data});
        }).catch((error)=>{
            console.error(error);
        });
    }

    pullUnfinishedExams(onDone=null) {
        if (this.props.perspective.id==='allexams') {
            var url = '/api/exam/list';
        } else {
            var url = `/api/exam/list/for/${this.props.user.id}`
        }
        Axios.get(url).then((response)=>{
            var examsList = (Object.keys(response.data).length==0) ? {} : response.data;
            this.setState({examsList}, ()=>{
                this.pullStatistics(onDone);
            });
        }).catch((error)=>{
            console.error(error);
        });
    }

    pullStatistics(onDone=null) {
        var examsIds = [];
        if (this.state.examsList!==null) {
            for(var eId in this.state.examsList) {
                examsIds.push(this.state.examsList[eId].id);
            }
        }
        if (this.state.examsList!==null && examsIds.length>0) {
            var exams = examsIds.join(",");
            Axios.get(`/api/exam/scoring/${exams}`).then((response)=>{
                this.setState({statisticsList: response.data});
                if (typeof(onDone)==='function') {
                    onDone(response.data);
                }
            }).catch((error)=>{
                console.error(error);
            });
        } else if (this.state.examsList!==null && examsIds.length==0) {
            this.setState({statisticsList: {}});
        }
    }

    render() {
        if (this.state.usersList===null || this.state.schemasList===null || this.state.examsList===null || this.state.statisticsList===null) {
            return ( <PleaseWait /> );
        }

        // Jeśli examId, competenceId podane jako parametry - pokaż listę zadań dla egzaminu
        if (this.props.params[0]!==null && this.props.params[1]!==null && this.props.params[2]===null
                && !isNaN(this.props.params[0]) && !isNaN(this.props.params[1])) {

            var exam = this.state.examsList[this.props.params[0]];
            var schema = this.state.schemasList[exam.schema_id];
            var statistics = this.state.statisticsList[exam.id];
            var competence =  schema.competences[this.props.params[1]];
            var allowedUsers = exam.competences_users[competence.id];
            var canScore = (allowedUsers[this.props.user.id]===this.props.user.id);
            return (
                <CompetenceCard
                    user={this.props.user}
                    exam={exam}
                    statistics={statistics}
                    competenceId={competence.id}
                    canScore={canScore}
                    requestStatisticsRefreshCallback={this.pullStatistics}
                />
            );
        }

        // Jeśli examId, competenceId, taskId podane jako parametry - pokaż ekran oceny
        if (this.props.params[0]!==null && this.props.params[1]!==null && this.props.params[2]!==null
                && !isNaN(this.props.params[0]) && !isNaN(this.props.params[1]) && !isNaN(this.props.params[2])) {
            var exam = this.state.examsList[this.props.params[0]];
            var schema = this.state.schemasList[exam.schema_id];
            var competence =  schema.competences[this.props.params[1]];
            var taskId = competence.tasks[this.props.params[2]];
            var allowedUsers = exam.competences_users[competence.id];
            var canScore = (allowedUsers[this.props.user.id]===this.props.user.id);
            if (!exam || !competence || !taskId) return (`Ocena ${this.props.params[0]}/${this.props.params[1]}/${this.props.params[2]} jest niemożliwa.`);
            return (
                <Exam
                    exam={exam}
                    competence={competence}
                    taskId={taskId}
                    user={this.props.user}
                    canScore={canScore}
                    requestStatisticsRefreshCallback={this.pullStatistics}
                />
            );
        }

        // Jeśli statycznie wskazano .../comment/edit/{examId}, - pokaż ekran edycji komentarza
        if (this.props.params[0]!==null && this.props.params[1]!==null && this.props.params[2]!==null
            && this.props.params[0]==='comment' && this.props.params[1]==='edit' && !isNaN(this.props.params[2])) {
                return (
                    <Examcomment
                        examId={parseInt(this.props.params[2])}
                        user={this.props.user}
                        users={this.state.usersList}
                        backTo='/assessment'
                    />
                );
        }

        // W innych przypadkach, pokaż listę egzaminów.
        var renderedExamsList = [];
        for (var key in this.state.examsList) {
            var exam = this.state.examsList[key];
            var isSelected = (this.state.selectedExamId===exam.id);
            renderedExamsList.push(
                <ExamCard
                    key={exam.id}
                    user={this.props.user}
                    exam={exam}
                    schema={this.state.schemasList[exam.schema_id]}
                    statistics={this.state.statisticsList[exam.id]}
                    users={this.state.usersList}
                    isExpanded={isSelected}
                    isPerspectiveAllExams={(this.props.perspective.id==='allexams')}
                    requestExamRefreshCallback={this.pullUnfinishedExams}
                    requestExamExpandCallback={this.expandExam}
                    onExamFinalizedCallback={this.onExamFinalized}
                />
            )
        }
        return (
            <div className="Assessment">
                {renderedExamsList}
                {(Object.keys(this.state.examsList).length==0) &&
                    <div>Nie masz trwających egzaminów</div>
                }
            </div>
        );
    }

    onExamFinalized(exam) {
        this.pullUnfinishedExams();
    }

    expandExam(exam) {
        this.setState({
            selectedExamId: (exam.id===this.state.selectedExamId) ? null : exam.id
        });
    }
}
