import React, { Component } from 'react';
import Axios from 'axios';
import PleaseWait from '../../components/PleaseWait';
import Examinfo from './Examinfo';

export default class Assessment extends Component {

    constructor(props) {
        super(props);
        this.state = {
            memberExams: null
        }
    }

    componentDidMount() {
        Axios.get("/api2/exam/list-unfinished-for-member/"+this.props.dictionary.user.id).then((response) => {
            var memberExams = response.data;
            console.log(memberExams);
            for(var ekey in memberExams) {
                for (var ckey in memberExams[ekey].competences) {
                    memberExams[ekey].competences[ckey].tasks.sort(function(a,b) {
                        return a.order_signature > b.order_signature;
                    })
                }
            }
            this.setState({memberExams});
        });
    }

    render() {
        if (this.state.memberExams===null) {
            return ( <PleaseWait /> );
        }

        var renderedExamsList = [];
        for (var key in this.state.memberExams) {
            var exam = this.state.memberExams[key];
            renderedExamsList.push(
                <Examinfo
                    key={exam.id}
                    dictionary={this.props.dictionary}
                    exam={exam}
                />
            )
        }
        return (
            <div className="Assessment">
                {renderedExamsList}
            </div>
        );
    }

}
