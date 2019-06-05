import React, { Component } from 'react';
import SchemaDetails from './SchemaDetails';

export default class SchemasList extends Component {

    render() {
        var renderedSchemas = [];
        for (var sId in this.props.schemasList) {
            renderedSchemas.push(
                <SchemaDetails
                    key={this.props.schemasList[sId].id}
                    schema={this.props.schemasList[sId]}
                    usersList={this.props.usersList}
                    deleteSchemaCallback={this.props.deleteSchemaCallback}
                />
            )
        }
        return (
            <div className="SchemasList">
                {renderedSchemas}
            </div>
        );
    }

}
