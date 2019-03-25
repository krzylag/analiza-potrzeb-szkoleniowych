
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

import Topmenu from './components/TopMenu';
import Footer from './components/Footer';
import Axios from 'axios';

export const PERSPECTIVES = {
    "assessment": { id: 'assessment', name: "Moje Egzaminy"},
    "new": { id: 'new', name: "Nowy"},
    "archive": { id: 'archive', name: "Zakończone"},
    "users": { id: 'users', name: "Użytkownicy"},
    "settings": { id: 'settings', name: "Ustawienia"}
};
export const PERSPECTIVE_DEFAULT = 'assessment';

export default class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dictionary: {
                user: null
            }
        }
    }

    componentDidMount() {
        // Axios.get('/api2/user').then((response)=>{
        //     var oldDict = this.state.dictionary;
        //     oldDict.user = response.data;
        //     this.setState({dictionary: oldDict});
        // });
    }

    render() {
        var perspective = (typeof(this.props.perspective)!=='undefined' && typeof(PERSPECTIVES[this.props.perspective])!=='undefined') ? PERSPECTIVES[this.props.perspective] : PERSPECTIVES[PERSPECTIVE_DEFAULT];
        return (
            <div className="App">
                <Topmenu
                    perspective={perspective}
                    dictionary={this.state.dictionary}
                />
                <div className="container content rounded border border-light">
                    {perspective.id}
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
