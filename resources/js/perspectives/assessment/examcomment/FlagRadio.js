import React, { Component } from 'react';

export default class FlagRadio extends Component {

    constructor(props) {
        super(props);
        this.radioClicked=this.radioClicked.bind(this);
    }

    render() {
        return (
            <div key={this.props.flagDefinition.name} className="FlagRadio" onClick={this.radioClicked}>
                <input type="radio" name={"competence-"+this.props.competence.id} checked={this.props.flagState} readOnly={true} />
                <span dangerouslySetInnerHTML={{__html:this.props.flagDefinition.text}} />
            </div>
        );
    }

    radioClicked() {
        this.props.flagClickedCallback(this.props.competence.id, this.props.flagDefinition.name);
    }

}
