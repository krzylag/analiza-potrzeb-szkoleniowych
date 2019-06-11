import React, { Component } from 'react';
import Axios from 'axios';
import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import PleaseWait from '../../../components/PleaseWait';

export const COMMENT_SEND_DELAY = 3000;

export const CKEDITOR_CONFIGURATION = {
    toolbar: [ 'bold', 'italic', 'bulletedList', 'numberedList' ]
}

export default class Taskcomment extends Component {

    constructor(props) {
        super(props);
        this.state = {
            comment: null,
            isSaving: false,
            isWaitingForSave: false
        }
        this.saveClicked = this.saveClicked.bind(this);
        this.commentChanged = this.commentChanged.bind(this);
        this.pushChangedComment = this.pushChangedComment.bind(this);
        this.timeoutId = null;
    }

    componentDidMount() {
        this.pullTaskComment();
    }

    render() {
        return (
            <div className="Taskcomment">
                {this.state.comment!==null &&
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
            </div>
        );
    }

    pullTaskComment() {
        Axios.get(`/api/exam/${this.props.exam.id}/competence/${this.props.competence.id}/task/${this.props.task.id}/get/comment`).then((response)=>{
            if (typeof(response.data.comment)!=='undefined' && response.data.comment!==null) {
                this.setState({comment: response.data.comment});
            } else {
                this.setState({comment: ''});
            }
        })
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
            Axios.post(`/api/exam/${this.props.exam.id}/competence/${this.props.competence.id}/task/${this.props.task.id}/set/comment`, {
                examId: this.props.exam.id,
                competenceId: this.props.competence.id,
                taskId: this.props.task.id,
                text: this.state.comment
            }).then((response)=>{
                // console.log(response.data)
            }).catch((error)=>{
                console.error(error);
                this.pullTaskComment();
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
