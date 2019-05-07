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
                surname: null,
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
        this.pullNewArchive();
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
        this.setState({
            filters: {
                surname: (newFilters.surname==='') ? null : newFilters.surname,
                schema_name: (newFilters.schema_name==='') ? null : newFilters.schema_name,
                not_before: (newFilters.not_before==='') ? null : newFilters.not_before,
                not_after: (newFilters.not_after==='') ? null : newFilters.not_after,
                only_failed: (newFilters.only_failed===true),
                only_succeed: (newFilters.only_succeed===true)
            }
        },() => {
            this.pullNewArchive();
        });
    }

    onExamReverted(exam) {
        var exams = this.state.exams;
        delete(exams[exam.id]);
        this.setState({exams});
    };

    pullNewArchive() {
        this.setState({exams: null})
        Axios.get('/api2/archive/list', {
            params: {
                filters: this.state.filters
            }
        }).then((response)=>{
            console.log(response.data);
            var exams = [];
            for (var key in response.data) {
                var exam = response.data[key];
                var competences = {};
                for (var ckey in exam.competences) {
                    competences[exam.competences[ckey].id]=exam.competences[ckey];
                }
                exam.competences = competences;
                exams[exam.id] = exam;
                exam.results_competences = {};
                exam.results_flags = {};
                for (var rkey in exam.results) {
                    var result = exam.results[rkey];
                    if (!isNaN(rkey)) {
                        exam.results_competences[rkey]=result;
                    } else {
                        exam.results_flags[rkey]=result;
                    }
                }
                delete(exam.results);
            }
            console.log(exams);
            this.setState({exams});
        })
    }
}
