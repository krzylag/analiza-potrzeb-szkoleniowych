import React, { Component } from 'react';

export default class Filters extends Component {

    constructor(props) {
        super(props);
        this.state = {
            surname: (this.props.filters.surname!==null) ? this.props.filters.surname : '',
            schema_name: (this.props.filters.schema_name!==null) ? this.props.filters.schema_name : '',
            not_before: (this.props.filters.not_before!==null) ? this.props.filters.not_before : '',
            not_after: (this.props.filters.not_after!==null) ? this.props.filters.not_after : '',
            only_failed: (this.props.filters.only_failed!==null) ? this.props.filters.only_failed : false,
            only_succeed: (this.props.filters.only_succeed!==null) ? this.props.filters.only_succeed : false,
        };

        this.onChangeSurname = this.onChangeSurname.bind(this);
        this.onChangeSchemaName = this.onChangeSchemaName.bind(this);
        this.onChangeNotBefore = this.onChangeNotBefore.bind(this);
        this.onChangeNotAfter = this.onChangeNotAfter.bind(this);
        this.onChangeOnlyFailed = this.onChangeOnlyFailed.bind(this);
        this.onChangeOnlySucceed = this.onChangeOnlySucceed.bind(this);
        this.onClearClick = this.onClearClick.bind(this);
        this.onFilterClick = this.onFilterClick.bind(this);
    }

    render() {
        return (
            <div className="Filters container bg-secondary text-light p-4 rounded">
                <div className="row">
                    <div className="col-sm">
                        nazwisko:
                    </div>
                    <div className="col-sm">
                        <input type="text" value={this.state.surname} onChange={this.onChangeSurname} />
                    </div>
                    <div className="col-sm">
                        schemat:
                    </div>
                    <div className="col-sm">
                        <input type="text" value={this.state.schema_name} onChange={this.onChangeSchemaName} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm">
                        Późniejsze niż:
                    </div>
                    <div className="col-sm">
                        <input type="date" value={this.state.not_before} onChange={this.onChangeNotBefore} />
                    </div>
                    <div className="col-sm">
                        Wcześniejsze niż:
                    </div>
                    <div className="col-sm">
                        <input type="date" value={this.state.not_after} onChange={this.onChangeNotAfter} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm">
                        <input type="checkbox" checked={this.state.only_succeed} onChange={this.onChangeOnlySucceed} /> Tylko w pełni zaliczone<br />
                        <input type="checkbox" checked={this.state.only_failed} onChange={this.onChangeOnlyFailed} /> Tylko częściowo niezaliczone
                    </div>
                    <div className="col-sm d-flex flex-row justify-content-between align-items-center">
                        <button type="button" className="btn btn-outline-light" onClick={this.onFilterClick}>Filtruj</button>
                        <button type="button" className="btn btn-outline-light" onClick={this.onClearClick}>usuń filtry</button>
                    </div>
                </div>

            </div>
        );
    }

    onChangeSurname(ev) {
        this.setState({surname: ev.target.value});
    }
    onChangeSchemaName(ev) {
        this.setState({schema_name: ev.target.value});
    }
    onChangeNotBefore(ev) {
        this.setState({not_before: ev.target.value});
    }
    onChangeNotAfter(ev) {
        this.setState({not_after: ev.target.value});
    }
    onChangeOnlyFailed() {
        this.setState({only_failed: !this.state.only_failed});
    }
    onChangeOnlySucceed() {
        this.setState({only_succeed: !this.state.only_succeed});
    }

    onFilterClick() {
        this.props.onFiltersChangedCallback(this.state);
    }

    onClearClick() {
        this.setState({
            surname: '',
            schema_name: '',
            not_before: '',
            not_after: '',
            only_failed: false,
            only_succeed: false
        }, () => {
            this.props.onFiltersChangedCallback(this.state);
        });
    }

}
