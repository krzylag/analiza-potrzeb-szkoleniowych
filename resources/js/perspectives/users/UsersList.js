import React, { Component } from 'react';
import UsersListRow from './UsersListRow';

export default class UsersList extends Component {

    constructor(props) {
        super(props);

    }

    render() {
        var renderedRows = [];
        for (var ukey in this.props.usersList) {
            var user = this.props.usersList[ukey];
            renderedRows.push(
                <UsersListRow
                    key={user.id}
                    user={user}
                    clickedCapabilityChangeCallback={this.props.clickedCapabilityChangeCallback}
                />
            )
        }
        return (
            <table className="UsersList table table-striped">
                <thead className="thead-dark">
                    <tr>
                        <th>nazwisko</th>
                        <th>imię</th>
                        <th>email</th>
                        <th>uprawnienia w systemie</th>
                        <th>zmiana danych</th>
                    </tr>
                </thead>
                <tbody>
                    {renderedRows}
                </tbody>
            </table>
        );
    }

}
