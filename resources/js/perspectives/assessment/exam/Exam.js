import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Axios from 'axios';
import Question from './Question';
import Taskcomment from './Taskcomment';
import PleaseWait from '../../../components/PleaseWait';

export default class Exam extends Component {

    constructor(props) {
        super(props);
        this.state = {
            timeStart: null,
            timeString: null,
            questions: null,
            scores: null
        }
        this.onStartZegaraClicked = this.onStartZegaraClicked.bind(this);
        this.onScoringButtonClicked = this.onScoringButtonClicked.bind(this);
        this.clockIntervalId = null;
    }

    componentDidMount() {
        this.pullQuestions();
        this.pullScores();
    }

    componentWillUnmount() {
        if (this.clockIntervalId!==null) {
            clearInterval(this.clockIntervalId);
            this.clockIntervalId=null;
        }
    }

    render() {
        var descriptionToRender = "<div>"+this.props.task.description.split("\n").join('</div><div>')+"</div>";
        var questionsToRender = [];
        var pointsSum = 0;
        if (this.state.questions!==null && this.state.scores!==null) {
            for(var qkey in this.state.questions) {
                var question = this.state.questions[qkey];
                questionsToRender.push(
                    <Question
                        key={qkey}
                        order={parseInt(qkey)+1}
                        exam={this.props.exam}
                        competence={this.props.competence}
                        task={this.props.task}
                        question={question}
                        score={this.state.scores[question.id]}
                        onScoringButtonClickedCallback={this.onScoringButtonClicked}
                    />
                )
                if (typeof(this.state.scores[question.id]) && this.state.scores[question.id]!==null) {
                    pointsSum += this.state.scores[question.id];
                }
            }
        }
        return (
        <div className="Exam">
            <p>
                <Link to={"/assessment/"+this.props.exam.id+"/"+this.props.competence.id} className="btn btn-outline-primary">Powrót do wyboru zadania</Link>
            </p>
            <div className="card">
                <div className="card-header">{this.props.task.name}</div>
                <div className="card-body">
                    <small dangerouslySetInnerHTML={{__html: descriptionToRender}} />
                    <p className="mt-2 mb-2">
                        Wymagany poziom zaliczenia: <strong>{Math.floor(this.props.task.score_threshold*10000)/100} %</strong>
                        &nbsp;({Math.ceil(this.props.task.computed_summary.points_threshold)} / {this.props.task.computed_summary.points_max})
                    </p>
                    <p className="mt-2 mb-2">
                        Czas trwania: <strong>{Math.floor(this.props.task.time_available/60)} min</strong>
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
                                {pointsSum} / {this.props.task.computed_summary.points_max}
                                <br /><small>( {Math.round(10000*pointsSum/this.props.task.computed_summary.points_max)/100} % )</small>
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
                                <th colSpan={2}>{this.props.task.table_header}</th>
                                <th>ocena</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questionsToRender}
                        </tbody>
                    </table>
                </div>
            </div>
            {this.props.task.can_comment===1 &&
                <div className="card mt-4">
                    <div className="card-header">Komentarz oceniającego</div>
                    <div className="card-body">
                        <Taskcomment
                            exam={this.props.exam}
                            competence={this.props.competence}
                            task={this.props.task}
                        />
                    </div>
                </div>
            }
        </div>
        );
    }

    pullQuestions() {
        Axios.get("/api2/exam/grading/get-tasks/"+this.props.exam.id+"/"+this.props.competence.id+"/"+this.props.task.id).then((response)=>{
            response.data.questions.sort(function(a,b) {
                return a.hash > b.hash;
            });
            this.setState({questions: response.data.questions});
        });
    }

    pullScores() {
        Axios.get("/api2/exam/grading/get-scores/"+this.props.exam.id+"/"+this.props.competence.id+"/"+this.props.task.id).then((response)=>{
            for (var key in response.data) {
                if (response.data[key]!==null) response.data[key]=parseFloat(response.data[key]);
            }
            this.setState({scores: response.data});
        });
    }

    onScoringButtonClicked(qId, score) {
        var scores = this.state.scores;
        scores[qId]=score;
        this.setState({scores});
    }

    onStartZegaraClicked() {
        if (this.clockIntervalId===null) {
            if (this.state.timeStart===null) this.setState({timeStart: new Date()});
            this.clockIntervalId = setInterval(()=>{
                var now = new Date();
                var diff = Math.floor(this.props.task.time_available-((now-this.state.timeStart)/1000));
                this.setState({
                    timeString: ('00'+Math.floor(diff/60)).slice(-2)+' : '+('00'+(diff%60)).slice(-2)
                })
            }, 500);
        }
    }
}
