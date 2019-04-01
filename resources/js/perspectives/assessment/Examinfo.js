import React, { Component } from 'react';
import Competenceinfo from './Competenceinfo';
import { Link } from 'react-router-dom';

export default class Examinfo extends Component {

    constructor(props) {
        super(props);
        this.state = {
            computedTime: []
        }
        this.onScoreClick = this.onScoreClick.bind(this);
    }

    render() {

        var renderedCompetences = [];
        for (var ckey in this.props.exam.competences) {
            var competence = this.props.exam.competences[ckey];
            var allowedUsers = JSON.parse(competence.pivot.allowed_users);
            var canScore = (allowedUsers.indexOf(this.props.dictionary.user.id) >= 0);
            if (canScore) {
                renderedCompetences.push(
                    <div key={competence.id} className="row pl-4" >
                        <div className="col-sm p-1">
                            {competence.name}
                        </div>
                        <div className="col-sm p-1">
                            <Link to={"/assessment/"+this.props.exam.id+"/"+competence.id} className="btn btn-sm btn-outline-primary">Oceniaj</Link>
                        </div>
                    </div>
                );
            }
        }
        return (
            <div className="Examinfo card mt-5" id={"exam"+this.props.exam.id}>
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
                <div className="container">
                    {renderedCompetences}
                </div>
            </div>
        );
    }



    onScoreClick() {

    }


}