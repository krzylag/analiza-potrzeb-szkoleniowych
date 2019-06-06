import React, { Component } from 'react';
import { normalizeScore } from '../../helpers/Formatters';
import Axios from 'axios';


export const OVERRIDE_NONE = 0;
export const OVERRIDE_ACCEPTED = 1;
export const OVERRIDE_NOEFFECT = 2;
export const OVERRIDE_HIDDEN = 3;

export default class ExamCardOverrideEditor extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isUnderEdit: false,
            currentValue: this.getCurrentValueFromExam()
        };
        this.setUnderEdit=this.setUnderEdit.bind(this);
        this.onValueChanged=this.onValueChanged.bind(this);
        this.clickedConfirm=this.clickedConfirm.bind(this);
        this.clickedRevert=this.clickedRevert.bind(this);
    }

    render() {

        var currentState = '';
        switch (this.state.currentValue) {
            case OVERRIDE_ACCEPTED:
                currentState = (<span className="text-primary">szkolenie uznane</span>);
                break;
            case OVERRIDE_NOEFFECT:
                currentState = (<span className="text-primary">nie podlega</span>);
                break;
            case OVERRIDE_HIDDEN:
                currentState = (<span className="text-muted">szkolenie ukryte</span>);
                break;
            default:
                if (normalizeScore(this.props.training.score_threshold) <= normalizeScore(this.props.currentScore)) {
                    currentState = (<span className="text-success">pozytywny</span>);
                } else {
                    currentState = (<span className="text-danger">negatywny</span>);
                }
        }

        if (!this.state.isUnderEdit) {
            return (
                <div className="ExamCardOverrideEditor">
                    {currentState}
                    <button type="button" className="btn btn-default" onClick={this.setUnderEdit}>
                        <img src="/images/edit.png" />
                    </button>
                </div>

            )
        }
        return (
            <div className="ExamCardOverrideEditor">
                <select value={this.state.currentValue} onChange={this.onValueChanged}>
                    <option value={OVERRIDE_NONE}>nie modyfikuj</option>
                    <option value={OVERRIDE_ACCEPTED}>szkolenie uznane</option>
                    <option value={OVERRIDE_NOEFFECT}>nie podlega</option>
                    <option value={OVERRIDE_HIDDEN}>szkolenie ukryte</option>
                </select>
                <button type="button" className="btn btn-default" onClick={this.clickedConfirm}>
                    <img src="/images/check.png" />
                </button>
                <button type="button" className="btn btn-default" onClick={this.clickedRevert}>
                    <img src="/images/revert.png" />
                </button>
            </div>
        );
    }

    onValueChanged(event) {
        this.setState({currentValue: parseInt(event.target.value)});
    }

    setUnderEdit() {
        this.setState({isUnderEdit: true});
    }

    clickedConfirm() {
        Axios.post(`/api/exam/${this.props.exam.id}/training/${this.props.training.id}/override/${this.state.currentValue}`, {
            exam_id: this.props.exam.id,
            training_id: this.props.training.id,
            override: this.state.currentValue
        }).then((response)=>{
            this.setState({isUnderEdit: false}, ()=>{
                this.props.requestExamRefreshCallback();
            });
        })
    }

    clickedRevert() {
        this.setState({isUnderEdit: false});
    }

    getCurrentValueFromExam() {
        if (this.props.exam.config==null) return OVERRIDE_NONE;
        var config = this.props.exam.config;
        if (typeof(config.overrides)==='undefined') return OVERRIDE_NONE;
        var override = parseInt(config.overrides[this.props.training.id]);
        if (isNaN(override)) return OVERRIDE_NONE;
        return override;
    }
}
