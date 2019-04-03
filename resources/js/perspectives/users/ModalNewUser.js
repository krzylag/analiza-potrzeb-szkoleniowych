import React, { Component } from 'react';
import Modal from 'react-modal';
import PleaseWait from '../../components/PleaseWait';
import {CAPABILITIES_NAMES} from './Users';
import Axios from 'axios';

Modal.setAppElement('#root');

const customStyles = {
    content : {
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)'
    }
};

export default class ModalNewUser extends Component {

    constructor(props) {
        super(props);

        this.state = {
            defaults: (typeof(this.props.user)!=='undefined' && this.props.user!==null) ? this.props.user : null,
            modalIsOpen: true,
            password1: '',
            password2: '',
            passwordNotValid: false,
            passwordNotSame: false,
            formNotCompleted: false,
            formIsSending: false,
            duplicatedEmail: false
        };

        this.openModal = this.openModal.bind(this);
        this.afterOpenModal = this.afterOpenModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.closeModalProceed = this.closeModalProceed.bind(this);
        this.closeModalDelete = this.closeModalDelete.bind(this);
        this.checkPasswd = this.checkPasswd.bind(this);

        this.refUserId=React.createRef();
        this.refEmail=React.createRef();
        this.refFirstname=React.createRef();
        this.refSurname=React.createRef();
        this.refPassword1=React.createRef();
        this.refPassword2=React.createRef();
        this.refCapabilities={};
        for (var key in CAPABILITIES_NAMES) {
            this.refCapabilities[key]=React.createRef();
        }
    }

    render() {
        var renderedCheckboxes = [];
        for (var key in CAPABILITIES_NAMES) {
            renderedCheckboxes.push(
                <div key={key} className="m-2 d-flex flex-row justify-content-start align-items-baseline">
                    <input type="checkbox" ref={this.refCapabilities[key]} className="mr-2"/>
                    <div>{CAPABILITIES_NAMES[key]}</div>
                </div>
            );
        }
        return (
            <div className="ModalNewUser">
                <Modal
                    isOpen={this.state.modalIsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    style={customStyles}
                    contentLabel="Nowy użytkownik"
                >
                    <form>
                        <input type="hidden" name="id" value="" ref={this.refUserId} />
                        <div className="form-group row">
                            <label htmlFor="email" className="col-sm-5 col-form-label">Adres email:</label>
                            <div className="col-sm-7">
                                <input type="email" className="form-control-plaintext" id="email" placeholder="email@example.com" ref={this.refEmail} />
                            </div>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="firstname" className="col-sm-5 col-form-label">Imię</label>
                            <div className="col-sm-7">
                                <input type="text" className="form-control-plaintext" id="firstname" placeholder="imię" ref={this.refFirstname} />
                            </div>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="surname" className="col-sm-5 col-form-label">Nazwisko</label>
                            <div className="col-sm-7">
                                <input type="text" className="form-control-plaintext" id="surname" placeholder="nazwisko" ref={this.refSurname} />
                            </div>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="password1" className="col-sm-5 col-form-label">Hasło</label>
                            <div className="col-sm-7">
                                <input type="password" className="form-control-plaintext" id="password1" placeholder="hasło" ref={this.refPassword1} value={this.state.password1} onChange={this.checkPasswd} />
                                <input type="password" className="form-control-plaintext" id="password2" placeholder="powtórz hasło" ref={this.refPassword2} value={this.state.password2} onChange={this.checkPasswd} />
                                {this.state.passwordNotValid && <small className="text-danger"> Hasło musi mieć minimum 8 znaków, a w tym duże litery, małe litery i cyfry lub znaki specjalne. </small>}
                                {this.state.passwordNotSame && <small className="text-danger"> Wprowadzone hasła nie są takie same. </small>}
                            </div>
                        </div>
                        <div className="form-group row">
                            <div className="col-sm-4">
                                Uprawnienia
                            </div>
                            <div className="col-sm-8">
                                {renderedCheckboxes}
                            </div>
                        </div>
                        {!this.state.formIsSending &&
                            <div className="d-flex flex-row justify-content-between align-items-center">
                                <button type="button" onClick={this.closeModalProceed} className="btn btn-outline-success">Zapisz</button>
                                {(this.state.defaults!==null && !isNaN(this.state.defaults.id)) &&
                                    <button type="button" onClick={this.closeModalDelete} className="btn btn-outline-danger">Skasuj użytkownika</button>
                                }
                                <button type="button" onClick={this.closeModal} className="btn btn-outline-danger">Anuluj</button>
                            </div>
                        }
                        {this.state.formIsSending &&
                            <div>
                                <PleaseWait size="2em" />
                            </div>
                        }
                        {this.state.formNotCompleted &&
                            <div className="text-danger text-center">
                                Uzupełnij wszystkie pola formularza!
                            </div>
                        }
                        {this.state.duplicatedEmail &&
                            <div className="text-danger text-center">
                                Nie udało się stworzyć użytkownika, ponieważ taki adres email już istnieje.
                            </div>
                        }
                    </form>
                </Modal>
            </div>
        );
    }

    openModal() {
        //this.setState({modalIsOpen: true});
    }

    afterOpenModal() {
        if (this.state.defaults!==null) {
            this.refUserId.current.value=this.state.defaults.id;
            this.refEmail.current.value=this.state.defaults.email;
            this.refFirstname.current.value=this.state.defaults.firstname;
            this.refSurname.current.value=this.state.defaults.surname;
            for (var key in CAPABILITIES_NAMES) {
                this.refCapabilities[key].current.checked = this.state.defaults.capabilities[key];
            }
        }
    }

    closeModal(event, forceReload) {
        if (!this.state.formIsSending) {
            this.setState({modalIsOpen: false});
            this.props.onModalClosedCallback( (forceReload===true));
        }
    }

    closeModalProceed() {
        if (!this.checkFormValid()) {
            this.setState({formNotCompleted: true, duplicatedEmail: false, formNotCompleted: false })
        } else {
            this.setState({formIsSending: true, duplicatedEmail: false, formNotCompleted: false});
            var payload = this.getPayload();
            Axios.post('/api2/user/add', payload).then((response)=>{
                this.setState({formIsSending: false});
                if (response.data.result===true) {
                    this.closeModal(null, true);
                } else {
                    this.setState({formIsSending: false, duplicatedEmail: true});
                }
            }).catch((response)=>{
                this.setState({formIsSending: false});
                if (response.data.result===false) {
                    this.setState({formIsSending: false, duplicatedEmail: true});
                }
            })
        }
    }

    closeModalDelete() {
        if (confirm("Czy na pewno usunąć użytkownika z systemu?")) {
            Axios.post('/api2/user/delete', {
                id: (this.state.defaults!==null && !isNaN(this.state.defaults.id)) ? this.state.defaults.id : null
            }).then((response)=>{
                this.setState({formIsSending: false});
                if (response.data.result===true) {
                    this.closeModal(null, true);
                }
            }).catch((response)=>{
                this.setState({formIsSending: false});
            })
        }
    }

    checkPasswd() {
        var pass1 = this.refPassword1.current.value;
        var pass2 = this.refPassword2.current.value;
        this.setState({
            password1: pass1,
            password2: pass2,
            passwordNotSame: !this.testPasswordsSame(),
            passwordNotValid: !this.testPasswordValid()
        });
    }

    getPayload() {
        var payload = {
            id: (this.state.defaults!==null && !isNaN(this.state.defaults.id)) ? this.state.defaults.id : null,
            email: this.refEmail.current.value,
            firstname: this.refFirstname.current.value,
            surname: this.refSurname.current.value,
            password: this.state.password1,
            capabilities: {}
        };
        for (var key in this.refCapabilities) {
            payload.capabilities[key] = this.refCapabilities[key].current.checked;
        }
        return payload;
    }

    checkFormValid() {
        return (
            this.refEmail.current.value.trim()!=='' && this.refEmail.current.validity.valid
            && this.refFirstname.current.value.trim()!==''
            && this.refSurname.current.value.trim()!==''
            && this.testPasswordsSame()
            && this.testPasswordValid()
        );
    }

    testPasswordsSame() {
        var pass1 = this.refPassword1.current.value;
        var pass2 = this.refPassword2.current.value;
        return (pass1===pass2);
    }

    testPasswordValid() {
        var pass1 = this.refPassword1.current.value;
        var lenFlag = (pass1.length>=8);
        var ucaseFlag = (pass1.search(/[A-Z]/)>=0);
        var lcaseFlag = (pass1.search(/[a-z]/)>=0);
        var specFlag = (pass1.search(/^[a-zA-Z]/)>=0);
        return ( (ucaseFlag && lcaseFlag && specFlag && lenFlag) || (this.state.defaults!==null && !isNaN(this.state.defaults.id) && pass1.length===0) );
    }

}
