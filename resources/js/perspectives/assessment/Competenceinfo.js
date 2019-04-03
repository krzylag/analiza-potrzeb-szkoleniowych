import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Taskinfo from './Taskinfo';
import Axios from 'axios';

export default class Competenceinfo extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tasksActive: [],
            grading: null,
            tasksStatuses: null
        }
        this.onCheckboxClick = this.onCheckboxClick.bind(this);
    }

    componentDidMount() {
        this.getAcceptanceStates();
    }

    render() {
        var usedSeconds = 0;
        var avgScoreSum = 0;
        var avgScoreCount = 0;

        var renderedTasks = [];
        for(var tkey in this.props.competence.tasks) {
            var task = this.props.competence.tasks[tkey];
            var isChecked = (typeof(this.state.tasksActive[task.id])!=='undefined') ? this.state.tasksActive[task.id] : null;
            if (this.state.tasksStatuses!==null && isChecked) {
                usedSeconds += task.time_available;
                avgScoreSum += this.state.tasksStatuses[task.id].ans_sum/this.state.tasksStatuses[task.id].q_all;
                avgScoreCount ++;
            }
            var status = (this.state.tasksStatuses===null) ? null : this.state.tasksStatuses[task.id];
            renderedTasks.push(
                <Taskinfo
                    key={task.id}
                    exam={this.props.exam}
                    competence={this.props.competence}
                    task={task}
                    status={status}
                    isChecked={isChecked}
                    onCheckboxClickCallback={this.onCheckboxClick}
                />
            )
        }

        return (
            <div className="Competenceinfo">
                <p>
                    <Link to={{pathname: "/assessment", hash: "exam-"+this.props.exam.id}} className="btn btn-outline-primary">Powrót do listy egzaminów</Link>
                </p>
                <br />
                <h2>{this.props.exam.schema.shortname}</h2>
                <h3>{this.props.exam.firstname} {this.props.exam.surname} ({this.props.exam.workplace})</h3>
                <br />
                <h3>{this.props.competence.name}</h3>
                <small>{this.props.competence.description}</small>
                <div className="estimates d-flex flex-row justify-content-around text-primary mt-4 mb-4">
                    <h5>Przewidywany czas: <strong>{Math.floor(usedSeconds/60)} min</strong></h5>
                    <h5>Przewidywany wynik: <strong>{Math.ceil(10000*avgScoreSum/avgScoreCount)/100} %</strong></h5>
                </div>
                <table className="table table-sm">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>zadanie</th>
                            <th>czas</th>
                            <th>czy wchodzi w zakres oceny?</th>
                            <th>ocenianie</th>
                            <th>status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderedTasks}
                    </tbody>
                </table>
            </div>
        );
    }

    onCheckboxClick(exam, competence, task) {
        var payload = {
            examId: exam.id,
            competenceId: competence.id,
            taskId: task.id
        }
        Axios.post('/api2/exam/accepted-task/toggle', payload).then((response)=>{
            var tasks = this.state.tasksActive;
            tasks[task.id]=(response.data.new_state===1);
            this.setState({tasksActive: tasks})
        });
    }

    getAcceptanceStates() {
        Axios.get('/api2/exam/accepted-task/list/'+this.props.exam.id+"/"+this.props.competence.id).then((response)=>{
            //console.log(response.data);
            this.setState({tasksActive: response.data});
        });
        Axios.get('/api2/exam/grading/get-competence-scores/'+this.props.exam.id+"/"+this.props.competence.id).then((response)=>{
            this.setState({tasksStatuses: response.data});
        });
    }
}
