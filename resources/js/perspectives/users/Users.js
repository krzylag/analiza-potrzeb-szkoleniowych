import React, { Component } from 'react';
import Axios from 'axios';
import UsersList from './UsersList';
import ModalNewUser from './ModalNewUser';

export const CAPABILITIES_NAMES = {
    "can_examine":  "może egzaminować",
    "can_lead":  "może przewodniczyć",
    "can_manage_schemas": "może zmieniać schematy egzaminów",
    "can_manage_users": "może zarządzać użytkownikami",
    "can_search": "dostęp do archiwum",
    "is_admin": "Administrator (wszystkie uprawnienia)"
};

export default class Users extends Component {

    constructor(props) {
        super(props);
        this.state = {
            visibleModalNewUser: false,
            subjectUser: null
        }
        this.clickedNewUser=this.clickedNewUser.bind(this);
        this.clickedCapabilityChange=this.clickedCapabilityChange.bind(this);
        this.onModalClosed=this.onModalClosed.bind(this);
    }

    render() {
        return (
            <div className="Users">
                <button type="button" className="btn btn-primary m-3" onClick={this.clickedNewUser} >Nowy użytkownik</button>
                <UsersList
                    dictionary={this.props.dictionary}
                    clickedCapabilityChangeCallback={this.clickedCapabilityChange}
                />
                <button type="button" className="btn btn-primary m-3" onClick={this.clickedNewUser} >Nowy użytkownik</button>
                {this.state.visibleModalNewUser &&
                    <ModalNewUser
                        user={this.state.subjectUser}
                        onModalClosedCallback={this.onModalClosed}
                    />
                }
            </div>
        );
    }

    clickedNewUser() {
        if (!this.state.visibleModalNewUser)
        this.setState({
            visibleModalNewUser: true,
            subjectUser: null
        })
    }

    clickedCapabilityChange(user) {
        if (!this.state.visibleModalNewUser)
        this.setState({
            visibleModalNewUser: true,
            subjectUser: user
        })
    }

    onModalClosed(requestReload) {
        this.setState({
            visibleModalNewUser: false,
            subjectUser: null
        })
        if (requestReload===true) {
            document.location = document.location.href;
        }
    }

}
