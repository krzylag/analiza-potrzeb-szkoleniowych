import React, { Component } from 'react';
import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import PleaseWait from '../../components/PleaseWait';
// import { Link } from 'react-router-dom';
import {CKEDITOR_CONFIGURATION,COMMENT_SEND_DELAY} from './exam/Taskcomment';
import Axios from 'axios';

export default class CompetenceCardComment extends Component {

    constructor(props) {
        super(props);
        this.state = {
            comment: null,
            isSaving: false,
            hasUnsavedChanges: false
        };
        this.commentChanged=this.commentChanged.bind(this);
        this.importClicked=this.importClicked.bind(this);
        this.saveClicked=this.saveClicked.bind(this);
    }

    componentDidMount() {
        this.getCompetenceComment();
    }

    getCompetenceComment() {
        Axios.get(`/api/exam/${this.props.exam.id}/competence/${this.props.competence.id}/get-comment`).then((response)=>{
            this.setState({
                comment: (response.data.result==true && typeof(response.data.comments[this.props.user.id]!=='undefined')) ? response.data.comments[this.props.user.id] : ''
            });
        })
    }

    render() {
        if (this.state.comment===null) return ( <PleaseWait /> );

        return (
            <div className="CompetenceCardComment mt-5">
                <h3>Komentarz dla <strong>{this.props.exam.firstname} {this.props.exam.surname}</strong> do kompetencji <strong>{this.props.competence.name}</strong></h3>
                <div className="text-right">
                    {this.state.isSaving &&
                        <PleaseWait suffix={null} />
                    }
                    {!this.state.isSaving &&
                        <button type="button" className="btn btn-outline-primary" onClick={this.importClicked}>importuj komentarze cząstkowe</button>
                    }
                </div>
                <CKEditor
                    editor={ ClassicEditor }
                    config={CKEDITOR_CONFIGURATION}
                    data={this.state.comment}
                    onChange={this.commentChanged}
                />
                {this.state.isSaving &&
                    <PleaseWait size="2.5em" prefix="Zapisywanie" />
                }
                {!this.state.isSaving &&
                    <button type="button" className="btn btn-outline-success btn-lg m-2" onClick={this.saveClicked} disabled={!this.state.hasUnsavedChanges}>Zapisz zmiany</button>
                }
            </div>
        );
    }

    commentChanged(event, editor) {
        if (this.state.isSaving===false) {
            this.setState({
                comment: editor.getData(),
                hasUnsavedChanges: true
            });
        }
    }

    importClicked() {
        if (confirm("Cały komentarz zostanie bezpowrotnie zastąpiony sumą Twoich komentarzy cząstkowych z zadań. Będą one wymagały dalszej obróbki. Czy kontynuować?")) {
            Axios.get(`/api/exam/${this.props.exam.id}/competence/${this.props.competence.id}/get-default-comment/`).then((response)=>{
                var newComments = [];
                for (var ckey in response.data) {
                    var competence = response.data[ckey];
                    for (var ukey in competence.users) {
                        var user = competence.users[ukey];
                        var newComment = [];
                        for (var tkey in user.tasks) {
                            var task = user.tasks[tkey];
                            newComment.push('<strong>'+task.task_name+':</strong>');
                            newComment.push(task.task_comment);
                        }
                        newComments.push(newComment.join('<br />'));
                    }
                }
                if (newComments.length>0) {
                    this.setState({
                        comment: newComments.join('<br />')
                    })
                } else {
                    alert("W systemie nie ma komentarzy do zaimportowania.")
                }

            })
        }

    }

    saveClicked() {
        if (this.state.isSaving===false) {
            this.setState({
                isSaving: true
            },()=>{
                Axios.post(`/api/exam/${this.props.exam.id}/competence/${this.props.competence.id}/set-comment`, {
                    examId: this.props.exam.id,
                    competenceId: this.props.competence.id,
                    comment: this.state.comment
                }).then((response)=>{
                    console.log(response.data);
                    this.setState({
                        hasUnsavedChanges: false,
                        isSaving: false
                    });
                }).catch((error)=>{
                    console.error(error);
                    this.setState({
                        isSaving: false
                    });
                });
            });
        }
    }
}
