import React, { Component } from 'react';
import rotator from './PleaseWait.svg';
export default class PleaseWait extends Component {

    render() {
        var waitStyles = {
            backgroundImage: 'url('+rotator+')',
            zIndex: 10
        };
        if (typeof(this.props.size)!=='undefined' && this.props.size!==null) {
            waitStyles.height = this.props.size;
            waitStyles.width = this.props.size;
        }
        if (typeof(this.props.styles)!=='undefined' && this.props.styles!==null) {
            for (var key in this.props.styles) {
                waitStyles[key]=this.props.styles[key];
            }
        }
        return (
        <div className="PleaseWait" style={waitStyles}>

        </div>
        );
    }

}
