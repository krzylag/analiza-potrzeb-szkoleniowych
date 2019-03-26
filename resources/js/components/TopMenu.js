import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { PERSPECTIVES } from '../app';
import PleaseWait from './PleaseWait';

export default class Topmenu extends Component {


    render() {

        var renderedMenu = [];
        var renderedName = '';

        if (typeof(this.props.dictionary.user)==='undefined' || this.props.dictionary.user===null) {
            renderedMenu = (
                <PleaseWait key="PleaseWait" />
            )
        } else {

            var renderedLinksUsage = [];
            var renderedLinksManagement = [];

            for (var perId in PERSPECTIVES) {
                var per = PERSPECTIVES[perId];
                if (per.testUser(this.props.dictionary.user)) {
                    var linkClass;
                    if (perId===this.props.perspective.id) {
                        linkClass = ' active';
                    } else {
                        linkClass = '';
                    }
                    var item = (
                        <li key={perId} className="nav-item">
                            <Link key={PERSPECTIVES[perId].id} to={PERSPECTIVES[perId].id} className={"nav-link"+linkClass}>{PERSPECTIVES[perId].name}</Link>
                        </li>
                    );
                    if (per.group==='management') {
                        renderedLinksManagement.push(item);
                    } else {
                        renderedLinksUsage.push(item);
                    }
                }
            }

            if (renderedLinksUsage.length > 0) {
                renderedMenu = renderedLinksUsage;
            }

            if (renderedLinksManagement.length > 0) {

                renderedMenu.push(
                    <li key="management" className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Administracja
                        </a>
                        <ul className="dropdown-menu bg-dark" aria-labelledby="navbarDropdown">
                            {renderedLinksManagement}
                        </ul>
                    </li>
                )
            }

            renderedName = (
                <div key="user" className="navbar-text text-light">{this.props.dictionary.user.firstname} {this.props.dictionary.user.surname}</div>
            );

        }


        return (
            <nav className="Topmenu navbar navbar-expand navbar-dark bg-dark justify-content-between mb-3">
                <ul className="user-links navbar-nav">
                    {renderedMenu}
                </ul>
                {renderedName}
                <a href="/logout" className="nav-link align-right text-secondary" >Wyloguj się</a>

            </nav>
        );

    }

}
