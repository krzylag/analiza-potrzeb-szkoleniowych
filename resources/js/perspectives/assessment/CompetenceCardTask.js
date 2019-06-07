import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import Axios from 'axios';
import { formatScore } from '../../helpers/Formatters';
import tick from '../../images/check.png';
import PleaseWait from '../../components/PleaseWait';

export default class CompetenceCardTask extends Component {

    constructor(props) {
        super(props);
        this.onCheckboxClick = this.onCheckboxClick.bind(this);
        this.state = {
            isAwaitingForRefresh: false
        }
    }

    render() {

        var isCheckedClass = (this.props.isChecked===true) ? ' is-checked' : '';
        var isCheckedStyle = (this.props.isChecked===true) ? {backgroundImage: 'url('+tick+')'} : {};
        var isIncomplete = (this.props.isChecked===true && this.props.statistics.count < this.props.statistics.count_max);
        var isComplete = (this.props.isChecked===true && this.props.statistics.count == this.props.statistics.count_max);

        var statClasses = 'lineheight11';
        if (isIncomplete) statClasses += ' progress-bar progress-bar-striped progress-bar-animated bg-danger';
        if (isComplete) statClasses += ' progress-bar progress-bar-striped bg-success';
        return (
            <tr className="CompetenceCardTask">
                <td>{this.props.task.order_signature}</td>
                <td>
                <Link
                        to={"/assessment/"+this.props.exam.id+"/"+this.props.competence.id+"/"+this.props.task.id}
                        className="btn btn-outline-primary"
                    >{this.props.task.name}</Link>
                </td>
                <td>{this.props.trainingNames.join(", ")}</td>
                <td>{Math.floor(this.props.task.time_available/60)} min</td>
                <td className="text-center align-middle">
                    {this.state.isAwaitingForRefresh &&
                        <PleaseWait suffix={null} />
                    }
                    {!this.state.isAwaitingForRefresh &&
                        <div
                            className={"custom-checkbox-use-task"+isCheckedClass}
                            style={isCheckedStyle}
                            onClick={this.onCheckboxClick}
                        />
                    }
                </td>
                <td>
                    <div className={statClasses}>
                        Ocenione {this.props.statistics.count} / {this.props.statistics.count_max}, <br />
                        wynik: {formatScore(this.props.statistics.avg)}
                    </div>
                </td>
            </tr>
        );
    }

    onCheckboxClick() {
        this.setState({isAwaitingForRefresh: true}, ()=>{
            var payload = {
                examId: this.props.exam.id,
                competenceId: this.props.competence.id,
                taskId: this.props.task.id
            }
            Axios.post(`/api/exam/${payload.examId}/competence/${payload.competenceId}/task/${payload.taskId}/toggle-accepted`, payload).then((response)=>{
                this.props.requestStatisticsRefreshCallback(()=>{
                    this.setState({isAwaitingForRefresh: false});
                });
            }).catch((error)=>{
                console.error(error);
                this.setState({isAwaitingForRefresh: false});
            });
        })
    }
}
