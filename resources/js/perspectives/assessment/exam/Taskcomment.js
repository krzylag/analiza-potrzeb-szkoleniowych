import React, { Component } from 'react';
import Axios from 'axios';
import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import PleaseWait from '../../../components/PleaseWait';

export const COMMENT_SEND_DELAY = 1500;

export const CKEDITOR_CONFIGURATION = {
    toolbar: [ 'bold', 'italic', 'bulletedList', 'numberedList' ]
}

export default class Taskcomment extends Component {

    constructor(props) {
        super(props);
        this.state = {
            comment: null,
            isSaving: false
        }
        this.pushChangedComment = this.pushChangedComment.bind(this);
        this.timeoutId = null;
    }

    componentDidMount() {
        this.pullTaskComment();
    }

    render() {
        return (
            <div className="Taskcomment">
                {this.state.isSaving &&
                    <PleaseWait size="2em" styles={{"position": "absolute", "right":"1em"}} />
                }
                {this.state.comment!==null &&
                    <CKEditor
                        editor={ ClassicEditor }
                        config={CKEDITOR_CONFIGURATION}
                        data={this.state.comment}
                        onChange={this.pushChangedComment}
                    />
                }
            </div>
        );
    }

    pullTaskComment() {
        Axios.get('/api2/exam/grading/get-comment/'+this.props.exam.id+"/"+this.props.competence.id+"/"+this.props.task.id).then((response)=>{
            if (typeof(response.data.comment)!=='undefined' && response.data.comment!==null) {
                this.setState({comment: response.data.comment});
            } else {
                this.setState({comment: ''});
            }
        })
    }

    pushChangedComment(event, editor) {
        this.setState({comment: editor.getData(), isSaving: true});
        if (this.timeoutId!==null) {
            clearTimeout(this.timeoutId);
            this.timeoutId=null;
        }
        this.timeoutId = setTimeout(()=>{
            Axios.post("/api2/exam/grading/set-comment", {
                examId: this.props.exam.id,
                competenceId: this.props.competence.id,
                taskId: this.props.task.id,
                text: this.state.comment
            }).then((response)=>{
                // console.log(response.data)
            }).catch((error)=>{

            }).then(()=>{
                this.timeoutId=null;
                this.setState({isSaving: false});
                // console.log('timeout cleared');
            });
        },COMMENT_SEND_DELAY);
    }
}
