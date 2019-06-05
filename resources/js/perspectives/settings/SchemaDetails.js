import React, { Component } from 'react';
import { formatDateTime } from '../../helpers/Formatters';
import Axios from 'axios';

export default class SchemaDetails extends Component {

    constructor(props) {
        super(props);
        this.deleteSchema=this.deleteSchema.bind(this);
    }

    render() {

        var renderedCompetences = [];
        for (var cId in this.props.schema.competences) {
            renderedCompetences.push(
                <div key={cId}><strong>{this.props.schema.competences[cId].name}</strong> ({this.props.schema.competences[cId].task_count} zadań)</div>
            )
        }
        var renderedTrainings = [];
        for (var tId in this.props.schema.trainings) {
            renderedTrainings.push(
                <div key={tId}><strong>{this.props.schema.trainings[tId].fullname}</strong> ({this.props.schema.trainings[tId].task_count} zadań)</div>
            )
        }

        var createdBy = this.props.usersList[this.props.schema.created_by].surname+" "+this.props.usersList[this.props.schema.created_by].firstname;
        return (
            <div className="SchemaDetails mb-5">
                <div>
                    <button type="button" className="btn btn-outline-danger float-right" onClick={this.deleteSchema}>Usuń schemat</button>
                    <h4>{this.props.schema.fullname}</h4>
                    <p><i>
                        schemat {this.props.schema.id} utworzony: <strong>{formatDateTime(this.props.schema.created_at)}</strong> przez: {createdBy}
                    </i></p>
                </div>
                <table className="table table-sm">
                    <tbody>
                        <tr>
                            <th>z perspektywy ocenianych kompetencji:</th>
                            <td>{renderedCompetences}</td>
                        </tr>
                        <tr>
                            <th>z perspektywy raportowanych szkoleń:</th>
                            <td>{renderedTrainings}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

    deleteSchema() {
        if (confirm("Czy na pewno chcesz skasować schemat "+this.props.schema.fullname+" ?")) {
            this.props.deleteSchemaCallback(this.props.schema.id);
        }
    }
}
