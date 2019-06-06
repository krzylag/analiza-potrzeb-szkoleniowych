import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { resolveUserNames } from '../../helpers/Formatters';

export default class ExamCardCompetences extends Component {

    render() {

        var renderedCompetences = [];

        for (var ckey in this.props.schema.competences) {
            var competence = this.props.schema.competences[ckey];
            var canScore = this.props.exam.allowed_competences[competence.id];
            renderedCompetences.push(this.renderCompetenceRow(competence, canScore));
        }

        return (
            <div className="ExamCardCompetences card-body">
                <h4>Oceniane kompetencje:</h4>
                <table className="table table-sm">
                    <thead>
                        <tr>
                            <th rowSpan="2">#</th>
                            <th rowSpan="2">kompetencja</th>
                            <th rowSpan="2">przydział</th>
                            <th colSpan="3">zadania</th>
                        </tr>
                        <tr>
                            <th>możliwe</th>
                            <th>zaznaczone</th>
                            <th>kompletne</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderedCompetences}
                    </tbody>
                </table>
            </div>
        );
    }

    renderCompetenceRow(competence, canScore) {

        var renderAssignedUsers = [];
        for(var uId in this.props.exam.competences_users[competence.id]) {
            renderAssignedUsers.push(
                <div key={uId}>{resolveUserNames(this.props.exam.competences_users[competence.id][uId], this.props.users)}</div>
            );
        }

        var completedTasksInComp = this._calcActiveAndCompletedTasksInCompetence(competence);
        var activeTasksInComp = this._calcActiveTasksInCompetence(competence);
        var rowClass = '';
        if (activeTasksInComp > completedTasksInComp) {
            rowClass += ' progress-bar progress-bar-striped progress-bar-animated bg-danger';
        }
        return (
            <tr key={competence.id}>
                <th>{competence.order_signature}</th>
                <td>
                    {canScore &&
                        <Link to={"/assessment/"+this.props.exam.id+"/"+competence.id} className="btn btn-outline-primary d-block">{competence.name}</Link>
                    }
                    {!canScore &&
                        <div className="btn btn-outline-dark d-block disabled">{competence.name}</div>
                    }
                </td>
                <td>{renderAssignedUsers}</td>
                <td>{this._calcAllTasksInCompetence(competence)}</td>
                <td>{activeTasksInComp}</td>
                <td className={rowClass}>{completedTasksInComp}</td>
            </tr>

        )
    }

    _calcAllTasksInCompetence(competence) {
        return competence.task_count;
    }

    _calcActiveTasksInCompetence(competence) {
        var activeCount=0;
        for(var tkey in competence.tasks) {
            var statTask = this.props.statistics.tasks[tkey];
            if (statTask.accepted) activeCount++;
        }
        return activeCount;
    }

    _calcActiveAndCompletedTasksInCompetence(competence) {
        var completedCount=0;
        for(var tkey in competence.tasks) {
            var statTask = this.props.statistics.tasks[tkey];
            if (statTask.accepted && statTask.count == statTask.count_max) completedCount++;
        }
        return completedCount;
    }

}

