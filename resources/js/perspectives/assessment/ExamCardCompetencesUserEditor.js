import React, { Component } from 'react';
import Select from 'react-select';
import Axios from 'axios';
import { resolveUserNames } from '../../helpers/Formatters';

export default class ExamCardCompetencesUserEditor extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isUnderEdit: false,
            possibleOptions: [],
            selectedOptions: []
        };

        for (var ukey in this.props.users) {
            var user = this.props.users[ukey];
            this.state.possibleOptions.push(this._createOption(user));
        }

        for (var ukey in this.props.assignedIds) {
            var user = this.props.users[this.props.assignedIds[ukey]];
            this.state.selectedOptions.push(this._createOption(user));
        }

        this.setUnderEdit=this.setUnderEdit.bind(this);
        this.onValueChanged=this.onValueChanged.bind(this);
        this.clickedConfirm=this.clickedConfirm.bind(this);
        this.clickedRevert=this.clickedRevert.bind(this);
    }

    render() {

        if (this.state.isUnderEdit) {
            return this.renderEdit();
        } else {
            return this.renderLook();
        }
    }

    renderEdit() {
        return (
            <div className="ExamCardCompetencesUserEditor">
                <Select
                    value={this.state.selectedOptions}
                    options={this.state.possibleOptions}
                    isMulti={true}
                    onChange={this.onValueChanged}
                />
                <button type="button" className="btn btn-default" onClick={this.clickedConfirm}>
                    <img src="/images/check.png" />
                </button>
                <button type="button" className="btn btn-default" onClick={this.clickedRevert}>
                    <img src="/images/revert.png" />
                </button>
            </div>
        );
    }

    renderLook() {
        var renderedUserNames = [];
        for (var uKey in this.props.assignedIds) {
            var userName = resolveUserNames(uKey, this.props.users);
            renderedUserNames.push(
                <div key={uKey} className="user-display">{userName}</div>
            )
        }
        return (
            <div className="ExamCardCompetencesUserEditor">
                <button type="button" className="btn btn-default float-right" onClick={this.setUnderEdit}>
                    <img src="/images/edit.png" />
                </button>
                {renderedUserNames}
            </div>
        );
    }

    onValueChanged(selectedOptions) {
        this.setState({selectedOptions});
    }

    setUnderEdit() {
        this.setState({isUnderEdit: true});
    }

    clickedConfirm() {
        var values = [];
        for (var key in this.state.selectedOptions) {
            values.push(this.state.selectedOptions[key].value)
        }
        values = (values.length>0) ? values.join(",") : 0;
        Axios.post(`/api/exam/${this.props.exam.id}/competence/${this.props.competence.id}/users/${values}`, {
            exam_id: this.props.exam.id,
            competence_id: this.props.competence.id,
            users: values
        }).then((response)=>{
            this.setState({isUnderEdit: false}, ()=>{
                this.props.requestExamRefreshCallback();
            });
        })
    }

    clickedRevert() {
        this.setState({isUnderEdit: false});
    }

    _createOption(user) {
        if (typeof(user)==='undefined') {
            return null;
        } else {
            return { value: user.id, label: user.firstname+" "+user.surname }
        }
    }
}
