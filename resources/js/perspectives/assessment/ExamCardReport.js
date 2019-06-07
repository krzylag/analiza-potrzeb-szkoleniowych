import React, { Component } from 'react';
import { formatScore } from '../../helpers/Formatters';
import ExamCardOverrideEditor from './ExamCardOverrideEditor';

export default class ExamCardReport extends Component {

    render() {

        var renderedTrainings = [];

        for (var tkey in this.props.schema.trainings) {
            var training = this.props.schema.trainings[tkey];
            renderedTrainings.push(this.renderTrainingRow(training));
        }

        return (
            <div className="ExamCardReport card-body">
                <h4>Wyniki w raporcie:</h4>
                <table className="table table-sm">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>szkolenie</th>
                            <th>zadania</th>
                            <th>wynik</th>
                            <th>rezultat</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderedTrainings}
                    </tbody>
                </table>
            </div>
        );
    }

    renderTrainingRow(training) {

        var activeTasksCount = this._countActiveTasksInTraining(training);
        var taskClasses = '';
        if (activeTasksCount==0) {
            taskClasses += ' progress-bar progress-bar-striped progress-bar-animated bg-danger';
        } else if (activeTasksCount<4) {
            taskClasses += ' progress-bar progress-bar-striped progress-bar-animated bg-warning text-dark';
        }
        return (
            <tr key={training.id}>
                <th>{training.order_signature}</th>
                <td>{training.fullname}</td>
                <td>
                    <span className={taskClasses}>{this._countActiveTasksInTraining(training)}</span>
                </td>
                <td>{formatScore(this._calcPercentageOfActiveTasksInTraining(training))}</td>
                <td>
                    <ExamCardOverrideEditor
                        exam={this.props.exam}
                        training={training}
                        currentScore={this._calcPercentageOfActiveTasksInTraining(training)}
                        requestExamRefreshCallback={this.props.requestExamRefreshCallback}
                    />
                </td>
            </tr>

        )
    }

    _countActiveTasksInTraining(training) {
        var count=0;

        for(var tId in training.tasks) {
            var task = this.props.statistics.tasks[tId];
            if (task.accepted) count++;
        }
        return count;
    }

    _calcPercentageOfActiveTasksInTraining(training) {
        var sum=0;
        var count=0;
        for(var tkey in training.tasks) {
            var statTask = this.props.statistics.tasks[tkey];
            if (statTask.accepted && statTask.count>0) {
                sum += statTask.avg;
                count++;
            }
        }
        return (count>0) ? (sum/count) : 0;
    }

}

