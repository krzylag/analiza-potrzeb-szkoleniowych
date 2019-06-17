
/**
 * First we will load all of this project's JavaScript dependencies which
 * includes React and other helpers. It's a great starting point while
 * building robust, powerful web applications using React + Laravel.
 */

require('./bootstrap');

/**
 * Next, we will create a fresh React component instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

import {BrowserRouter, Route} from 'react-router-dom';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import User from './types/User';

import Topmenu from './components/TopMenu';
import Footer from './components/Footer';
import Perspective from './types/Perspective';
import Settings from './perspectives/settings/Settings';
import Newexam from './perspectives/newexam/Newexam';
import Assessment from './perspectives/assessment/Assessment';
import PleaseWait from './components/PleaseWait';
import Archive from './perspectives/archive/Archive';
import Users from './perspectives/users/Users';

export const PERSPECTIVE_DEFAULT = new Perspective('assessment', "Moje Egzaminy", 'usage', ['is_admin', 'can_lead', 'can_examine']);

export const PERSPECTIVES = {
    'assessment':   PERSPECTIVE_DEFAULT,
    'newexam':      new Perspective('newexam', "Nowy", 'usage', ['is_admin', 'can_lead']),
    'archive':      new Perspective('archive', "Zakończone", 'usage', ['is_admin', 'can_lead', 'can_search']),
    'users':        new Perspective('users', "Użytkownicy", 'management', ['is_admin', 'can_manage_users']),
    'allexams':     new Perspective('allexams', "Wszystkie egzaminy", 'management', ['is_admin']),
    'settings':     new Perspective('settings', "Schematy", 'management', ['is_admin', 'can_manage_schemas'])
};


export default class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            user: null
        }
    }

    componentDidMount() {
        new User().then((response) => {
            this.setState({user: response});
        })
    }

    render() {
        if (this.state.user===null) {
            return ( <PleaseWait /> );
        }
        var perspective = (typeof(this.props.perspective)!=='undefined' && typeof(PERSPECTIVES[this.props.perspective])!=='undefined') ? PERSPECTIVES[this.props.perspective] : PERSPECTIVE_DEFAULT;
        var params = [
            (typeof(this.props.param1)!=='undefined') ? this.props.param1 : null,
            (typeof(this.props.param2)!=='undefined') ? this.props.param2 : null,
            (typeof(this.props.param3)!=='undefined') ? this.props.param3 : null
        ];
        var renderPerspective;
        switch (perspective.id) {
            case 'assessment':
                renderPerspective = (
                    <Assessment
                        user={this.state.user}
                        perspective={perspective}
                        params={params}
                    />
                );
                break;
            case 'newexam':
                renderPerspective = (
                    <Newexam
                        user={this.state.user}
                        params={params}
                    />
                );
                break;
            case 'archive':
                renderPerspective = (
                    <Archive
                        user={this.state.user}
                        params={params}
                    />
                );
                break;
            case 'settings':
                renderPerspective = (
                    <Settings
                        params={params}
                    />
                );
                break;
            case 'users':
                renderPerspective = (
                    <Users
                        params={params}
                    />
                );
                break;
            case 'allexams':
                renderPerspective = (
                    <Assessment
                        user={this.state.user}
                        perspective={perspective}
                        params={params}
                    />
                );
                break;
            default:
                renderPerspective = (
                    <div>{perspective.id}</div>
                );
        }
        return (
            <div className="App">
                <Topmenu
                    perspective={perspective}
                    user={this.state.user}
                />
                <div className="content">
                    <div className="container rounded border border-light">
                        {renderPerspective}
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

}

if (document.getElementById('root')) {
    ReactDOM.render(
        <BrowserRouter>
            <Route path="/:perspective?/:param1?/:param2?/:param3?" render={(props)=>(
                    <App
                        perspective={props.match.params.perspective}
                        param1={props.match.params.param1}
                        param2={props.match.params.param2}
                        param3={props.match.params.param3}
                    />
            )} />
        </BrowserRouter>
    , document.getElementById('root'));
}
