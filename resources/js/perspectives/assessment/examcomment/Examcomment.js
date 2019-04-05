import React, { Component } from 'react';
import Axios from 'axios';
import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import PleaseWait from '../../../components/PleaseWait';
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
        this.timeoutId = null;
    }

    componentDidMount() {
        Axios.get('/api2/exam/get/'+this.props.examId).then((response)=>{
            this.setState({
                examOriginal: response.data
            });
        })
        Axios.get('/api2/archive/preview/long/'+this.props.examId).then((response)=>{
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
        var canEditComment = (this.props.dictionary.user.capabilities.is_admin || this.state.examOriginal.created_by==this.props.dictionary.user.id);
        return (
            <div className="Examcomment">
                {this.state.summaryHtmlBefore!==null &&
                    <div dangerouslySetInnerHTML={{__html: this.state.summaryHtmlBefore}} />
                }
                <div className="mt-5 mb-5 ">
                    {this.state.comment!==null && canEditComment &&
                        <div>
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
            Axios.post("/api2/exam/set-comment", {
                examId: this.state.examOriginal.id,
                comment: this.state.comment
            }).then((response)=>{
                //console.log(response.data)
            }).catch((error)=>{

            }).then(()=>{
                this.timeoutId=null;
                this.setState({
                    isWaitingForSave: false,
                    isSaving: false
                });
                // console.log('timeout cleared');
            });

    }

    saveClicked() {
        this.pushChangedComment();
    }
}
