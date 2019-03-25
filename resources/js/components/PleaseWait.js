import React, { Component } from 'react';
import rotator from './PleaseWait.svg';
export default class PleaseWait extends Component {

    render() {
        var waitStyles = {
            backgroundImage: 'url('+rotator+')'
        };
        if (typeof(this.props.size)!=='undefined' && this.props.size!==null) {
            waitStyles.height = this.props.size;
            waitStyles.width = this.props.size;
        }
        return (
            <div className="PleaseWait" style={waitStyles}>

            </div>
        );
    }

}
