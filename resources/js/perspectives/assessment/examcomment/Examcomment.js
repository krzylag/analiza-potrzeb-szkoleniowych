import React, { Component } from 'react';
import Axios from 'axios';
import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import moment from 'moment';
import PleaseWait from '../../../components/PleaseWait';
import {CKEDITOR_CONFIGURATION,COMMENT_SEND_DELAY} from '../exam/Taskcomment';
import { format } from 'url';

export default class Examcomment extends Component {

    constructor(props) {
        super(props);
        this.state = {
            examOriginal: null,
            comment: '',
            isSaving: false
        }
        this.pushChangedComment = this.pushChangedComment.bind(this);
        this.timeoutId = null;
    }

    componentDidMount() {
        Axios.get('/api2/exam/get/'+this.props.examId).then((response)=>{
            console.log(response.data);
            this.setState({
                examOriginal: response.data,
                comment: (response.data!==null && response.data.comment!==null) ? response.data.comment : ''
            });
        })
    }

    render() {
        if (this.state.examOriginal===null) {
            return (
                <PleaseWait size="2em" />
            )
        }
        return (
            <div className="Examcomment">
                {this.state.isSaving &&
                    <PleaseWait size="2em" styles={{"position": "absolute", "right":"1em"}} />
                }
                <h2>Egzaminowany: <strong>{this.state.examOriginal.surname} {this.state.examOriginal.firstname} ({this.state.examOriginal.workplace})</strong></h2>
                <h3><strong>{this.state.examOriginal.city}, {(new moment(this.state.examOriginal.created_at)).format('YYYY-MM-DD')}</strong></h3>
                <h3>Schemat: <strong>{this.state.examOriginal.schema.shortname}</strong></h3>
                <div>
                    <h3>Feedback dla uczestnika:</h3>
                    {this.state.comment!==null &&
                        <CKEditor
                            editor={ ClassicEditor }
                            config={CKEDITOR_CONFIGURATION}
                            data={this.state.comment}
                            onChange={this.pushChangedComment}
                        />
                    }
                </div>
            </div>
        );
    }

    pushChangedComment(event, editor) {
        this.setState({comment: editor.getData(), isSaving: true});
        if (this.timeoutId!==null) {
            clearTimeout(this.timeoutId);
            this.timeoutId=null;
        }
        this.timeoutId = setTimeout(()=>{
            Axios.post("/api2/exam/set-comment", {
                examId: this.state.examOriginal.id,
                comment: this.state.comment
            }).then((response)=>{
                console.log(response.data)
            }).catch((error)=>{

            }).then(()=>{
                this.timeoutId=null;
                this.setState({isSaving: false});
                // console.log('timeout cleared');
            });
        },COMMENT_SEND_DELAY);
    }
}
