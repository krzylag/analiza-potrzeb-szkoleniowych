import React, { Component } from 'react';
import Axios from 'axios';
import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import PleaseWait from '../../../components/PleaseWait';
import { Link } from 'react-router-dom';
import {CKEDITOR_CONFIGURATION,COMMENT_SEND_DELAY} from '../exam/Taskcomment';

export default class Examcomment extends Component {

    constructor(props) {
        super(props);
        this.state = {
            examOriginal: null,
            isSaving: false,
            isWaitingForSave: false,
            summaryHtmlBefore: null,
            comment: null,
            summaryHtmlAfter: null
        }

        this.saveClicked = this.saveClicked.bind(this);
        this.commentChanged = this.commentChanged.bind(this);
        this.pushChangedComment = this.pushChangedComment.bind(this);
        this.importClicked = this.importClicked.bind(this);
        this.timeoutId = null;
    }

    componentDidMount() {
        this.updateContents();
    }

    updateContents() {
        Axios.get(`/api/exam/${this.props.examId}/get`).then((response)=>{
            this.setState({
                examOriginal: response.data
            });
        })
        Axios.get(`/api/exam/${this.props.examId}/long/html`).then((response)=>{
            var summaryHtmlOriginal = response.data.split(/<!-- EXAM COMMENT SEPARATOR -->/);
            this.setState({
                summaryHtmlBefore: summaryHtmlOriginal[0],
                comment: summaryHtmlOriginal[1].trim(),
                summaryHtmlAfter: summaryHtmlOriginal[2]
            });
        })
    }

    render() {
        if (this.state.examOriginal===null || this.state.summaryHtmlBefore===null) {
            return (
                <PleaseWait />
            )
        }
        var canEditComment = (this.props.user.capabilities.is_admin || this.state.examOriginal.created_by==this.props.user.id);
        return (
            <div className="Examcomment">
                <Link to={this.props.backTo} className="btn btn-outline-primary">Powrót</Link>
                {this.state.summaryHtmlBefore!==null &&
                    <div dangerouslySetInnerHTML={{__html: this.state.summaryHtmlBefore}} />
                }
                <div className="mt-5 mb-5 ">
                    {this.state.comment!==null && canEditComment &&
                        <div>
                            <div className="text-right"><button type="button" className="btn btn-outline-primary" onClick={this.importClicked}>importuj komentarze cząstkowe</button></div>
                            <CKEditor
                                editor={ ClassicEditor }
                                config={CKEDITOR_CONFIGURATION}
                                data={this.state.comment}
                                onChange={this.commentChanged}
                            />
                            <div className="text-center m-2 position-relative">
                                {this.state.isSaving &&
                                    <PleaseWait size="2.5em" prefix="Zapisywanie" />
                                }
                                {!this.state.isSaving &&
                                    <button type="button" className="btn btn-outline-success btn-lg" onClick={this.saveClicked}>Zapisz zmiany</button>
                                }
                            </div>
                        </div>
                    }
                    {this.state.comment!==null && !canEditComment &&
                        <div dangerouslySetInnerHTML={{__html: this.state.comment}} />
                    }
                </div>
                {this.state.summaryHtmlAfter!==null &&
                    <div dangerouslySetInnerHTML={{__html: this.state.summaryHtmlAfter}} />
                }
            </div>
        );
    }

    commentChanged(event, editor) {
        if (this.state.isSaving===false) {

            this.setState({
                comment: editor.getData(),
                isWaitingForSave: true
            });
            if (this.timeoutId!==null) {
                clearTimeout(this.timeoutId);
                this.timeoutId=null;
            }

            this.timeoutId = setTimeout(()=>{
                this.pushChangedComment();
            },COMMENT_SEND_DELAY);
        }
    }

    pushChangedComment() {

            this.setState({
                isWaitingForSave: false,
                isSaving: true
            });
            Axios.post(`/api/exam/${this.state.examOriginal.id}/set-comment`, {
                examId: this.state.examOriginal.id,
                comment: this.state.comment
            }).then((response)=>{
                //
            }).catch((error)=>{
                console.error(error);
            }).then(()=>{
                this.timeoutId=null;
                this.setState({
                    isWaitingForSave: false,
                    isSaving: false
                });
            });

    }

    saveClicked() {
        this.pushChangedComment();
    }

    importClicked() {
        if (confirm("Cały komentarz zostanie bezpowrotnie zastąpiony sumą komentarzy cząstkowych. Będą one wymagały dalszej obróbki. Czy kontynuować?")) {
            Axios.get(`/api/exam/${this.props.examId}/get-default-comment/`).then((response)=>{
                var newComments = [];
                for (var ckey in response.data) {
                    var competence = response.data[ckey];
                    for (var ukey in competence.users) {
                        var user = competence.users[ukey];
                        var newComment = [
                            '<strong>'+competence.competence_name+' ('+user.user_name+')</strong>'
                        ];
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

}
