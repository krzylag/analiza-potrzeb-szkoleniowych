import React, { Component } from 'react';
import Axios from 'axios';
import UsersList from './UsersList';
import ModalNewUser from './ModalNewUser';
import PleaseWait from '../../components/PleaseWait';

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
            usersList: null,
            visibleModalNewUser: false,
            subjectUser: null
        }
        this.pullUsersList=this.pullUsersList.bind(this);
        this.clickedNewUser=this.clickedNewUser.bind(this);
        this.clickedCapabilityChange=this.clickedCapabilityChange.bind(this);
        this.onModalClosed=this.onModalClosed.bind(this);
    }

    componentDidMount() {
        this.pullUsersList();
    }

    pullUsersList() {
        Axios.get("/api/user/list").then((response)=>{
            this.setState({usersList: response.data});
        }).catch((error)=>{
            console.error(error);
        });
    }


    render() {
        return (
            <div className="Users">
                <button type="button" className="btn btn-primary m-3" onClick={this.clickedNewUser} >Nowy użytkownik</button>
                {this.state.usersList===null &&
                    <div><PleaseWait suffix={null} /></div>
                }
                {this.state.usersList!==null &&
                    <UsersList
                        usersList={this.state.usersList}
                        clickedCapabilityChangeCallback={this.clickedCapabilityChange}
                        onReloadUsersListCallback={this.pullUsersList}
                    />
                }
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
            subjectUser: null,
            usersList: null
        }, ()=>{
            this.pullUsersList();
        })

    }

}
