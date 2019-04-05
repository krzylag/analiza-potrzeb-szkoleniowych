import React, { Component } from 'react';
import Scoringbutton from './Scoringbutton';
import Axios from 'axios';
import PleaseWait from '../../../components/PleaseWait';

export default class Question extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isSaving: false
        }
        this.onScoringButtonClicked = this.onScoringButtonClicked.bind(this);
    }

    render() {
        var hintHtml = (this.props.question.hint!==null && this.props.question.hint!=='') ? '<p>'+this.props.question.hint.split("\n").join('</p><p>')+'</p>' : null;
        return (
            <tr className="Question">
                <td>{this.props.order}</td>
                <td>
                    <strong>{this.props.question.text}</strong>
                    {hintHtml!==null && <small dangerouslySetInnerHTML={{__html: hintHtml}} /> }
                </td>
                <td className="buttons">
                    {!this.state.isSaving && this.renderButtons() }
                    {this.state.isSaving &&
                        <PleaseWait prefix={null} />
                    }
                </td>
            </tr>
        );
    }

    renderButtons() {
        var possibleGrades = [];
        var grade = parseFloat(this.props.question.score_min);
        while (grade <= parseFloat(this.props.question.score_max)) {
            possibleGrades.push(grade);
            grade+=parseFloat(this.props.question.score_step);
        }

        var buttonsToRender=[];
        for (var pgkey in possibleGrades) {
            var value = possibleGrades[pgkey];
            var isActive = (this.props.score===value);
            buttonsToRender.push(
                <Scoringbutton
                    key={value}
                    value={value}
                    isActive={isActive}
                    onScoringButtonClickedCallback={this.onScoringButtonClicked}
                />
            );
        }
        return buttonsToRender;
    }

    onScoringButtonClicked(value) {
        this.setState({isSaving: true});
        var callParams = {
            examId: this.props.exam.id,
            competenceId: this.props.competence.id,
            taskId: this.props.task.id,
            questionId: this.props.question.id,
            value:  value
        }
        Axios.post("/api2/exam/grading/set-score", callParams).then((response)=>{
            var qId = parseInt(response.data.question_id)
            var score = parseFloat(response.data.score)
            this.props.onScoringButtonClickedCallback(qId, score);
        }).catch((error)=>{

        }).then(()=>{
            this.setState({isSaving: false});
        });
    }


}
