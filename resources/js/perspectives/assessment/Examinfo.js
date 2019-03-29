import React, { Component } from 'react';
import Competenceinfo from './Competenceinfo';

export default class Examinfo extends Component {

    constructor(props) {
        super(props);
        this.state = {
            computedTime: []
        }
        this.onCheckboxClick = this.onCheckboxClick.bind(this);
    }

    render() {


        console.log(this.props);

        var renderedCompetences = [];
        for (var ckey in this.props.exam.competences) {
            var competence = this.props.exam.competences[ckey];
            var allowedUsers = JSON.parse(competence.pivot.allowed_users);
            var canScore = (allowedUsers.indexOf(this.props.dictionary.user.id) >= 0);
            console.log({competence, allowedUsers, canScore});
            renderedCompetences.push(
                <Competenceinfo
                    key={competence.id}
                    exam={this.props.exam}
                    competence={competence}
                    canScore={canScore}
                />
            );
        }
        console.log(renderedCompetences);
        return (
            <div className="Examinfo card mt-5">
                <h5 className="card-header">{this.props.exam.firstname} {this.props.exam.surname}</h5>
                <div className="card-body">
                    <table className="table table-sm table-bordered">
                        <tbody>
                            <tr>
                                <td>Egzaminowany:</td>
                                <td>{this.props.exam.firstname} {this.props.exam.surname} {this.props.exam.workplace}</td>
                            </tr>
                            <tr>
                                <td>Schemat:</td>
                                <td>{this.props.exam.schema.fullname}</td>
                            </tr>
                            <tr>
                                <td>Miejscowość, data:</td>
                                <td>{this.props.exam.city}, {this.props.exam.date}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {renderedCompetences}
            </div>
        );
    }



    onCheckboxClick(exam, competence, task) {
        console.log({e: exam.id, c: competence.id, t: task.id});
    }


}
