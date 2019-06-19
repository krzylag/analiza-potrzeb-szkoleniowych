import React, { Component } from 'react';
import Axios from 'axios';
import SchemasList from './SchemasList';
import PleaseWait from '../../components/PleaseWait';
import FileImport from './FileImport';

export default class Settings extends Component {

    constructor(props) {
        super(props);
        this.state = {
            schemasList: null,
            usersList: null,
        }
        this.onDeleteSchema = this.onDeleteSchema.bind(this);
        this.pullSchemasList = this.pullSchemasList.bind(this);
    }

    componentDidMount() {
        this.pullSchemasList();
        this.pullUsersList();
    }

    pullSchemasList() {
        Axios.get("/api/schema/list").then((response)=>{
            this.setState({schemasList: response.data});
        }).catch((error)=>{
            console.error(error);
        });
    }

    pullUsersList() {
        Axios.get("/api/user/list/with-deleted").then((response)=>{
            this.setState({usersList: response.data});
        }).catch((error)=>{
            console.error(error);
        });
    }

    render() {

        return (
            <div className="Settings">
                <div className="card mt-4">
                    <h5 className="card-header">Istniejące schematy</h5>
                    <div className="card-body">
                        {(this.state.schemasList===null || this.state.usersList===null) &&
                            <PleaseWait />
                        }
                        {(this.state.schemasList!==null && this.state.usersList!==null) &&
                            <SchemasList
                                schemasList={this.state.schemasList}
                                usersList={this.state.usersList}
                                deleteSchemaCallback={this.onDeleteSchema}
                            />
                        }
                    </div>
                </div>
                <div className="card mt-5">
                    <h5 className="card-header">Import</h5>
                    <div className="card-body">
                        <FileImport
                            onSchemaImportedCallback={this.pullSchemasList}
                        />
                    </div>
                </div>
            </div>
        );
    }


    onDeleteSchema(schemaId) {
        Axios.post(`/api/schema/${schemaId}/delete`, {
            schema_id: schemaId
        }).then((response)=>{
            this.pullSchemasList();
        }).catch((error)=>{
            console.error(error);
        });
    }
}
