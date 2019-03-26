import React, { Component } from 'react';

export default class Settings extends Component {

    constructor(props) {
        super(props);
        this.onFileSelected = this.onFileSelected.bind(this);
    }

    render() {
        console.log(this.props.dictionary);

        return (
            <div className="Settings">
                <div className="card mt-4">
                    <h5 className="card-header">Istniejące schematy</h5>
                    <div className="card-body">
                        <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>
                    </div>
                </div>
                <div className="card mt-5">
                    <h5 className="card-header">Eksport</h5>
                    <div className="card-body">
                        <p className="card-text">Eksportuj schematy egzaminów / APS-ów do pliku XLSX, w celu późniejszej edycji.</p>
                        <button type="button" className="btn btn-outline-primary" >Eksportuj</button>
                    </div>
                </div>
                <div className="card mt-5">
                    <h5 className="card-header">Import</h5>
                    <div className="card-body">
                        <form>
                            <div className="input-group mb-3">
                                <div className="custom-file">
                                    <input type="file" className="custom-file-input" id="inputGroupFile02" onChange={this.onFileSelected}/>
                                    <label className="custom-file-label" for="inputGroupFile02" aria-describedby="inputGroupFileAddon02">Wybierz plik</label>
                                </div>
                            </div>
                            <input type="submit" className="btn btn-outline-primary" value="Wyślij" />
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    onFileSelected(ev) {
        console.log(ev.target.files[0].name);
    }
}
