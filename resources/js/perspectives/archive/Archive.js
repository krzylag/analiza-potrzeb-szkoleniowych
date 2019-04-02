import React, { Component } from 'react';
import Axios from 'axios';
import Filters from './Filters';
import Examslist from './Examslist';
import PleaseWait from '../../components/PleaseWait';

export default class Archive extends Component {

    constructor(props) {
        super(props);
        this.state = {
            exams: null,
            filters: {
                lastname: null,
                schema_name: null,
                not_before: null,
                not_after: null,
                only_failed: null,
                only_succeed: null
            }
        }
        this.onFiltersChanged = this.onFiltersChanged.bind(this);
        this.onExamReverted = this.onExamReverted.bind(this);
    }

    componentDidMount() {
        Axios.get('/api2/archive/list', {
            params: {
                filters: this.state.filters
            }
        }).then((response)=>{
            var exams = [];
            for (var key in response.data) {
                var exam = response.data[key];
                var competences = {};
                for (var ckey in exam.competences) {
                    competences[exam.competences[ckey].id]=exam.competences[ckey];
                }
                exam.competences = competences;
                exams[exam.id] = exam;
            }
            this.setState({exams});
        })
    }

    render() {
        if (this.state.exams===null) {
            return <PleaseWait size="3em" />
        }
        return (
            <div className="Archive">
                <Filters
                    filters={this.state.filters}
                    onFiltersChangedCallback={this.onFiltersChanged}
                />
                <Examslist
                    dictionary={this.props.dictionary}
                    exams={this.state.exams}
                    onExamRevertedCallback={this.onExamReverted}
                />
            </div>
        );
    }

    onFiltersChanged(newFilters) {
        this.setState({filters: newFilters});
    }

    onExamReverted(exam) {
        var exams = this.state.exams;
        delete(exams[exam.id]);
        this.setState({exams});
    }
}
