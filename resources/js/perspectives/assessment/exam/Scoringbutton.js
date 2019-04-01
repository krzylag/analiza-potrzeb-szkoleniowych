import React, { Component } from 'react';

export default class Scoringbutton extends Component {

    constructor(props) {
        super(props);
        this.onScoringButtonClicked = this.onScoringButtonClicked.bind(this);
    }

    render() {
        var isActiveClass = (this.props.isActive) ? " is-active" : "";
        return (
            <button key={this.props.value} type="button" className={"Scoringbutton btn btn-lg btn-link"+isActiveClass} onClick={this.onScoringButtonClicked}>
                {this.props.value}
            </button>
        );
    }

    onScoringButtonClicked() {
        this.props.onScoringButtonClickedCallback(this.props.value);
    }
}
