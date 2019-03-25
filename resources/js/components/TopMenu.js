import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {PERSPECTIVES } from '../app';
import PleaseWait from './PleaseWait';

export default class Topmenu extends Component {


    render() {
        console.log(this.props);

        var renderedLinks = [];
        for (var perId in PERSPECTIVES) {
            var linkClass;
            if (perId===this.props.perspective.id) {
                linkClass = ' btn-light';
            } else {
                linkClass = ' btn-outline-light';
            }
            renderedLinks.push(
                <Link key={PERSPECTIVES[perId].id} to={PERSPECTIVES[perId].id} className={"btn m-2 p-2 "+linkClass}>{PERSPECTIVES[perId].name}</Link>
            )
        }

        var renderedUser;
        if (this.props.dictionary.user===null) {
            renderedUser = (
                <PleaseWait size="2em"/>
            )
        } else {
            renderedUser = (
                <span>{this.props.dictionary.user.firstname} {this.props.dictionary.user.surname}</span>
            )
        }
        return (
            <nav className="Topmenu p-2 mb-3 bg-primary">
                {renderedLinks}
                <a href="/logout" className="btn btn-outline-light m-2 float-right" >Wyloguj się</a>
                <div className="user-name text-light m-2 d-inline-block float-right">{renderedUser}</div>

            </nav>
        );
    }

}
