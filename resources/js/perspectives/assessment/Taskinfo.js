import React, { Component } from 'react';

export default class Taskinfo extends Component {

    constructor(props) {
        super(props);
        this.onCheckboxClick = this.onCheckboxClick.bind(this);
    }

    render() {
        var isCheckedClass = (this.props.isChecked===true) ? ' is-checked' : '';
        return (
            <tr className="Taskinfo">
                <td>{this.props.task.order_signature}</td>
                <td>{this.props.task.name}</td>
                <td>{Math.floor(this.props.task.time_available/60)} min</td>
                <td className="text-center align-middle">
                    <div
                        className={"custom-checkbox-use-task"+isCheckedClass}
                        onClick={this.onCheckboxClick}
                    />
                </td>
                <td><button type="button" className="btn btn-outline-primary btn-sm">Wejdź</button></td>
            </tr>
        );
    }

    onCheckboxClick() {
        this.props.onCheckboxClickCallback(this.props.exam, this.props.competence, this.props.task);
    }
}
