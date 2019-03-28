import React, { Component } from 'react';
import Select from 'react-select';

export default class Examinerselect extends Component {

    constructor(props) {
        super(props);
        this.onExaminerChanged = this.onExaminerChanged.bind(this);
    }

    render() {

        var examinersOptions = [];
        for (var key in this.props.dictionary.examiners) {
            examinersOptions.push({
                value: this.props.dictionary.examiners[key].id,
                label: this.props.dictionary.examiners[key].surname+" "+this.props.dictionary.examiners[key].firstname
            });
        }

        return (
            <div className="form-row row align-items-center">
                <div className="col-sm-2 text-right">{this.props.competence.name}</div>
                <div className="col-sm-10 p-1">
                    <Select
                        value={this.props.selected}
                        options={examinersOptions}
                        onChange={this.onExaminerChanged}
                        isMulti={true}
                    />
                </div>
            </div>
        );
    }

    onExaminerChanged(val) {
        this.props.onExaminerChangedCallback(this.props.competence, val);
    }

}
