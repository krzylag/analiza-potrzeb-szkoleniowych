import React, { Component } from 'react';
import rotator from './PleaseWait.svg';
export default class PleaseWait extends Component {

    render() {
        var containerStyles = {
            zIndex: 10,
        };
        var rotatorStyles = {
            backgroundImage: 'url('+rotator+')'
        };

        if (typeof(this.props.size)!=='undefined' && this.props.size!==null) {
            rotatorStyles.height = this.props.size;
            rotatorStyles.width = this.props.size;
        }

        if (typeof(this.props.styles)!=='undefined' && this.props.styles!==null) {
            for (var key in this.props.styles) {
                containerStyles[key]=this.props.styles[key];
            }
        }
        var prefix;
        if (typeof(this.props.prefix)!=='undefined' && this.props.prefix!==null) {
            prefix = this.props.prefix;
        }
        var suffix;
        if (typeof(this.props.suffix)!=='undefined' && this.props.suffix!==null) {
            suffix = this.props.suffix;
        }
        if (typeof(this.props.prefix)==='undefined' && typeof(this.props.suffix)==='undefined') {
            suffix = "Odczyt danych z serwera.";
        }

        return (
        <div className="PleaseWait" style={containerStyles}>
            <div className="layout">
                {prefix!==null &&
                    <div className="prefix">{prefix}</div>
                }
                <div className="rotator" style={rotatorStyles} />
                {suffix!==null &&
                    <div className="suffix">{suffix}</div>
                }
            </div>
        </div>
        );
    }

}
