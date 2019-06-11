import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Axios from 'axios';
import Question from './Question';
import Taskcomment from './Taskcomment';
import PleaseWait from '../../../components/PleaseWait';
import { formatScore } from '../../../helpers/Formatters';

export default class Exam extends Component {

    constructor(props) {
        super(props);
        this.state = {
            timeStart: null,
            timeString: null,
            // questions: null,
            // scores: null,

            taskSchema: null,
            taskStatistics: null,

        }
        this.onStartZegaraClicked = this.onStartZegaraClicked.bind(this);
        this.onScoringButtonClicked = this.onScoringButtonClicked.bind(this);
        this.clockIntervalId = null;
    }

    componentDidMount() {
        this.pullTaskSchema();
        this.pullTaskStatistics();
    }

    componentWillUnmount() {
        if (this.clockIntervalId!==null) {
            clearInterval(this.clockIntervalId);
            this.clockIntervalId=null;
        }
    }

    pullTaskSchema() {
        Axios.get(`/api/exam/${this.props.exam.id}/competence/${this.props.competence.id}/task/${this.props.taskId}/get/schema`).then((response)=>{
            this.setState({taskSchema: response.data});
        }).catch((error)=>{
            console.error(error);
        });
    }

    pullTaskStatistics(onDone=null) {
        Axios.get(`/api/exam/${this.props.exam.id}/competence/${this.props.competence.id}/task/${this.props.taskId}/get/statistics`).then((response)=>{
            this.setState({taskStatistics: response.data}, ()=>{
                if(typeof(onDone)==='function') {
                    onDone();
                }
            });
        }).catch((error)=>{
            console.error(error);
        });
    }

    render() {
        if (this.state.taskSchema===null || this.state.taskStatistics===null) return ( <PleaseWait /> );

        var descriptionToRender = "<div>"+this.state.taskSchema.description.split("\n").join('</div><div>')+"</div>";
        var questionsToRender = [];
        var pointsSum = 0;

            for(var qId in this.state.taskSchema.questions) {
                var question = this.state.taskSchema.questions[qId];
                var userScore=(typeof(this.state.taskStatistics[question.id])!=='undefined' && typeof(this.state.taskStatistics[question.id]['users'][this.props.user.id])!=='undefined') ? this.state.taskStatistics[question.id]['users'][this.props.user.id] : null;
                questionsToRender.push(
                    <Question
                        key={question.id}
                        order={question.order_signature}
                        exam={this.props.exam}
                        competence={this.props.competence}
                        task={this.state.taskSchema}
                        question={question}
                        score={userScore}
                        onScoringButtonClickedCallback={this.onScoringButtonClicked}
                    />
                )
                if (userScore!==null) {
                    pointsSum += userScore.score;
                }
            }

        return (
        <div className="Exam">
            <p>
                <Link to={"/assessment/"+this.props.exam.id+"/"+this.props.competence.id} className="btn btn-outline-primary">Powrót do wyboru zadania</Link>
            </p>
            <div className="card">
                <div className="card-header">{this.state.taskSchema.name}</div>
                <div className="card-body">
                    <small dangerouslySetInnerHTML={{__html: descriptionToRender}} />
                    <p className="mt-2 mb-2">
                        Wymagany poziom zaliczenia: <strong>{formatScore(this.state.taskSchema.score_threshold)}</strong>
                        &nbsp;({Math.ceil(this.state.taskSchema.points_threshold)} / {this.state.taskSchema.questions_count})
                    </p>
                    <p className="mt-2 mb-2">
                        Czas trwania: <strong>{Math.floor(this.state.taskSchema.time_available/60)} min</strong>
                    </p>
                </div>
                <div className="card-body sticky-top bg-light border-top border-bottom">
                    {this.state.scores !== null &&
                        <div className="d-flex flex-row justify-content-between align-items-center">
                            {this.state.timeStart===null &&
                                <button type="button" className="btn btn-outline-primary" onClick={this.onStartZegaraClicked}>
                                    START ZEGARA
                                </button>
                            }
                            {this.state.timeStart!==null &&
                                <div className="zegar">
                                    {this.state.timeString}
                                </div>
                            }
                            <div className="suma">
                                {pointsSum} / {this.state.taskSchema.points_max}
                                <br /><small>( {formatScore(pointsSum/this.state.taskSchema.points_max)} )</small>
                            </div>
                        </div>
                    }
                    {this.state.scores === null &&
                        <PleaseWait />
                    }
                </div>
                <div className="card-body">
                    <table className="table">
                        <thead>
                            <tr>
                                <th colSpan={2}>{this.state.taskSchema.table_header}</th>
                                <th>ocena</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questionsToRender}
                        </tbody>
                    </table>
                </div>
            </div>
            {this.state.taskSchema.can_comment &&
                <div className="card mt-4">
                    <div className="card-header">Komentarz oceniającego</div>
                    <div className="card-body">
                        <Taskcomment
                            exam={this.props.exam}
                            competence={this.props.competence}
                            task={this.state.taskSchema}
                        />
                    </div>
                </div>
            }
        </div>
        );
    }


    onScoringButtonClicked(qId, score, onDone) {
        this.pullTaskStatistics(onDone);
        this.props.requestStatisticsRefreshCallback();
    }

    onStartZegaraClicked() {
        if (this.clockIntervalId===null) {
            if (this.state.timeStart===null) this.setState({timeStart: new Date()});
            this.clockIntervalId = setInterval(()=>{
                var now = new Date();
                var diff = Math.floor(this.state.taskSchema.time_available-((now-this.state.timeStart)/1000));
                this.setState({
                    timeString: ('00'+Math.floor(diff/60)).slice(-2)+' : '+('00'+(diff%60)).slice(-2)
                })
            }, 500);
        }
    }
}
