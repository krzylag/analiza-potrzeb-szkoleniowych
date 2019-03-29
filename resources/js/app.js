
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
import Axios from 'axios';

import Topmenu from './components/TopMenu';
import Footer from './components/Footer';
import Perspective from './types/Perspective';
import Settings from './perspectives/settings/Settings';
import Newexam from './perspectives/newexam/Newexam';

export const PERSPECTIVE_DEFAULT = new Perspective('assessment', "Moje Egzaminy", 'usage', ['is_admin', 'can_lead', 'can_examine']);

export const PERSPECTIVES = {
    'assessment':   PERSPECTIVE_DEFAULT,
    'newexam':      new Perspective('newexam', "Nowy", 'usage', ['is_admin', 'can_lead']),
    'archive':      new Perspective('archive', "Zakończone", 'usage', ['is_admin', 'can_lead', 'can_search']),
    'users':        new Perspective('users', "Użytkownicy", 'management', ['is_admin', 'can_manage_users']),
    'settings':     new Perspective('settings', "Schematy", 'management', ['is_admin', 'can_manage_schemas'])
};


export default class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dictionary: {
                user: null,
                schemas: null,
                examiners: null
            }
        }
    }

    componentDidMount() {
        new User().then((response) => {
            var oldDict = this.state.dictionary;
            oldDict.user = response;
            this.setState({dictionary: oldDict});
        })
        Axios.get('/api2/dictionary/get').then((response) => {
            var dictionary = this.state.dictionary;
            var schemas = [];
            for (var key in response.data.schemas) {
                var schema = response.data.schemas[key];
                var competences = [];
                for(var cKey in schema.competences) {
                    competences[schema.competences[cKey].id]=schema.competences[cKey];
                }
                schema.competences = competences;
                schemas[schema.id]=schema;
            }
            dictionary.schemas = schemas;
            var examiners = [];
            for (var key in response.data.examiners) {
                var examiner = response.data.examiners[key];
                examiners[examiner.id]=examiner;
            }
            dictionary.examiners = examiners;
            this.setState({dictionary});
        })
    }

    render() {
        var perspective = (typeof(this.props.perspective)!=='undefined' && typeof(PERSPECTIVES[this.props.perspective])!=='undefined') ? PERSPECTIVES[this.props.perspective] : PERSPECTIVE_DEFAULT;
        var renderPerspective;
        switch (perspective.id) {
            case 'newexam':
                renderPerspective = (
                    <Newexam
                        dictionary={this.state.dictionary}
                    />
                );
                break;
            case 'settings':
                renderPerspective = (
                    <Settings
                        dictionary={this.state.dictionary}
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
                    dictionary={this.state.dictionary}
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
