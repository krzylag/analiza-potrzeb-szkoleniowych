import React, { Component } from 'react';
import Axios from 'axios';
import Filters from './Filters';
import Examslist from './Examslist';
import PleaseWait from '../../components/PleaseWait';
import Examcomment from '../assessment/examcomment/Examcomment';

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
        // Jeśli statycznie wskazano .../comment/edit/{examId}, - pokaż ekran edycji komentarza
        if (this.props.params[0]!==null && this.props.params[1]!==null && this.props.params[2]!==null
            && this.props.params[0]==='comment' && this.props.params[1]==='edit' && !isNaN(this.props.params[2])) {
                return (
                    <Examcomment
                        examId={parseInt(this.props.params[2])}
                        user={this.props.user}
                        backTo='/archive'
                    />
                );
        }

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
                    user={this.props.user}
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
        this.setState({exams: null}, ()=>{
            Axios.get('/api/archive/list', {
                params: {
                    filters: this.state.filters
                }
            }).then((response)=>{
                var exams = {};
                for (var key in response.data) {
                    var exam=response.data[key];
                    exams[exam.id]=exam;
                }
                this.setState({exams});
            })
        })
    }
}
