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

        return (
            <tr key={training.id}>
                <th>{training.order_signature}</th>
                <td>{training.fullname}</td>
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

