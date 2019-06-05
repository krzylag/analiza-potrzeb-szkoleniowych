import React, { Component } from 'react';
import {CAPABILITIES_NAMES} from './Users';

export default class UsersListRow extends Component {

    constructor(props) {
        super(props);
        this.clickedCapabilityChange=this.clickedCapabilityChange.bind(this);
    }

    render() {
        var renderedCapabilities = [];
        if (this.props.user.capabilities.is_admin===true) {
            renderedCapabilities.push(this.renderCapability('is_admin'));
        } else {
            for (var cKey in this.props.user.capabilities) {
                if (this.props.user.capabilities[cKey]===true) {
                    renderedCapabilities.push(this.renderCapability(cKey));
                }
            }
        }

        return (
            <tr className="UsersListRow">
                <td>{this.props.user.surname}</td>
                <td>{this.props.user.firstname}</td>
                <td>{this.props.user.email}</td>
                <td>{renderedCapabilities}</td>
                <td><button type="button" className="btn btn-outline-primary" onClick={this.clickedCapabilityChange}>zmień dane</button></td>
            </tr>
        );
    }

    renderCapability(capKey) {
        return (
            <div
                key={capKey}
                className="capability-name"
            >
                {CAPABILITIES_NAMES[capKey]}
            </div>
        );
    }

    clickedCapabilityChange() {
        this.props.clickedCapabilityChangeCallback(this.props.user);
    }

}
