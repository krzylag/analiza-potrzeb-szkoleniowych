import React, { Component } from 'react';
import Taskinfo from './Taskinfo';
import Axios from 'axios';

export default class Competenceinfo extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tasksActive: []
        }
        this.onCheckboxClick = this.onCheckboxClick.bind(this);
    }

    render() {
        var usedSeconds = 0;

        var renderedTasks = [];
        for(var tkey in this.props.competence.tasks) {
            var task = this.props.competence.tasks[tkey];
            var isChecked = (typeof(this.state.tasksActive[task.id])!=='undefined') ? this.state.tasksActive[task.id] : false;
            if (isChecked) {
                usedSeconds += task.time_available;
            }
            renderedTasks.push(
                <Taskinfo
                    key={task.id}
                    exam={this.props.exam}
                    competence={this.props.competence}
                    task={task}
                    isChecked={isChecked}
                    onCheckboxClickCallback={this.onCheckboxClick}
                />
            )
        }
        return (
            <div className="card-body">
                <h3>{this.props.competence.name}</h3>
                <small>{this.props.competence.description}</small>
                <p>Przewidywany czas: {Math.floor(usedSeconds/60)} min</p>
                <table className="table table-sm">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>zadanie</th>
                            <th>czas</th>
                            <th>czy użyć do oceny?</th>
                            <th>ocenianie</th>
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
            console.log(response.data);
            var tasks = this.state.tasksActive;
            tasks[task.id]=(response.data.new_state===1);
            this.setState({tasksActive: tasks})
        })
        //this.getAcceptanceStates()
    }

    getAcceptanceStates() {
        Axios.get('/api2/exam/accepted-task/list/'+this.props.exam.id+"/"+this.props.competence.id).then((response)=>{
            console.log(response.data);
        })
    }
}
