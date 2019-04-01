import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import PleaseWait from '../../components/PleaseWait';
import tick from '../../images/check.png';

export default class Taskinfo extends Component {

    constructor(props) {
        super(props);
        this.onCheckboxClick = this.onCheckboxClick.bind(this);
    }

    render() {
        var isCheckedClass = (this.props.isChecked===true) ? ' is-checked' : '';
        var isCheckedStyle = (this.props.isChecked===true) ? {backgroundImage: 'url('+tick+')'} : {};
        return (
            <tr className="Taskinfo">
                <td>{this.props.task.order_signature}</td>
                <td>{this.props.task.name}</td>
                <td>{Math.floor(this.props.task.time_available/60)} min</td>
                <td className="text-center align-middle">
                    {this.props.isChecked!==null &&
                        <div
                            className={"custom-checkbox-use-task"+isCheckedClass}
                            style={isCheckedStyle}
                            onClick={this.onCheckboxClick}
                        />
                    }
                    {this.props.isChecked===null &&
                        <PleaseWait />
                    }
                </td>
                <td>
                    <Link
                        to={"/assessment/"+this.props.exam.id+"/"+this.props.competence.id+"/"+this.props.task.id}
                        className="btn btn-outline-primary btn-sm"
                    >Wejdź</Link>
                </td>
            </tr>
        );
    }

    onCheckboxClick() {
        this.props.onCheckboxClickCallback(this.props.exam, this.props.competence, this.props.task);
    }
}
