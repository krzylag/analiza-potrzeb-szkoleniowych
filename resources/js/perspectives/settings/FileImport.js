import React, { Component } from 'react';
import Axios from 'axios';
import PleaseWait from '../../components/PleaseWait';

export default class FileImport extends Component {

    constructor(props) {
        super(props);
        this.state = {
            file: null,
            uploadInProgress: false,
            uploadErrors: [],
            uploadNotices: []
        }
        this.onFileSelected = this.onFileSelected.bind(this);
        this.onUploadClicked = this.onUploadClicked.bind(this);
    }

    render() {

        var stringFilename = (this.state.file!==null) ? this.state.file.name : "Wybierz plik";
        var buttonDisabled = (this.state.file===null);

        return (
            <div className="FileImport">
                <div className="input-group mb-3">
                    <div className="custom-file">
                        <input type="file" className="custom-file-input" id="inputGroupFile02" onChange={this.onFileSelected}/>
                        <label className="custom-file-label" htmlFor="inputGroupFile02" aria-describedby="inputGroupFileAddon02">{stringFilename}</label>
                    </div>
                </div>
                { this.state.uploadInProgress &&
                    <PleaseWait suffix={null} />
                }
                { !this.state.uploadInProgress &&
                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={this.onUploadClicked}
                        disabled={buttonDisabled}
                    >Wyślij</button>
                }

            </div>
        );
    }


    onFileSelected(ev) {
        this.setState({file: ev.target.files[0]});
    }

    onUploadClicked() {
        this.setState({uploadInProgress: true}, ()=> {
            var data = new FormData();
            data.append('uploaded', this.state.file, this.state.file.name);
            var settings = { headers: { 'content-type': 'multipart/form-data' } };
            Axios.post("/api/schema/upload", data, settings).then((response)=>{
                if (response.data.result===false) {
                    if (response.data.errors.length>0) alert("Import nieudany.\n"+response.data.errors.join("\n"));
                    this.setState({
                        uploadInProgress: false,
                        file: null
                    });
                } else {
                    if (response.data.notices.length>0) alert("Uwaga.\n"+response.data.notices.join("\n"));
                    this.setState({
                        uploadInProgress: false,
                        file: null
                    }, ()=>{
                        this.props.onSchemaImportedCallback();
                    });
                }
            }).catch((error)=>{
                console.error(error);
                this.setState({uploadInProgress: false}, ()=>{
                    this.props.onSchemaImportedCallback();
                });
            })
        })

    }

}
