import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import CompetenceCardTask from './CompetenceCardTask';
import Axios from 'axios';
import { normalizeScore } from '../../helpers/Formatters';
import PleaseWait from '../../components/PleaseWait';
import CompetenceCardComment from './CompetenceCardComment';

export default class CompetenceCard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            schema: null
        }
        this.getFullSchema = this.getFullSchema.bind(this);
    }

    componentDidMount() {
        this.getFullSchema();
    }

    getFullSchema() {
        Axios.get(`/api/schema/${this.props.exam.schema_id}/get`).then((response)=>{
            this.setState({schema: response.data});
        }).catch((error)=>{
            console.error(error);
        })
    }

    render() {

        if (this.state.schema===null) return ( <PleaseWait /> );

        var usedSeconds = 0;
        var avgScoreSum = 0;
        var avgScoreCount = 0;

        var renderedTasks = [];

        var _competence = this.state.schema.competences[this.props.competenceId];

        for(var tkey in _competence.tasks) {

            var schemaTask = this.state.schema.tasks[_competence.tasks[tkey]];
            var statTask = this.props.statistics.tasks[_competence.tasks[tkey]];
            var trainingNames = [];
            for (var cKey in this.state.schema.competences) {
                var comp = this.state.schema.competences[cKey];
                if (comp.tasks[schemaTask.id]===schemaTask.id) {
                    trainingNames.push(comp.name);
                }
            }

            if (statTask.accepted===true) {
                usedSeconds += schemaTask.time_available;
                if (statTask.avg!==null) {
                    avgScoreSum += statTask.avg;
                    avgScoreCount ++;
                }
            }
            renderedTasks.push(
                <CompetenceCardTask
                    key={schemaTask.id}
                    exam={this.props.exam}
                    competence={_competence}
                    task={schemaTask}
                    statistics={statTask}
                    trainingNames={trainingNames}
                    isChecked={statTask.accepted}
                    requestStatisticsRefreshCallback={this.props.requestStatisticsRefreshCallback}
                />
            )
        }

        var displayedAvgScore = (avgScoreCount>0) ? normalizeScore(avgScoreSum/avgScoreCount) : 0;

        return (
            <div className="CompetenceCard">
                <p>
                    <Link to={{pathname: "/assessment", hash: "exam-"+this.props.exam.id}} className="btn btn-outline-primary">Powrót do listy egzaminów</Link>
                </p>
                <br />
                <h2>{this.state.schema.shortname}</h2>
                <h3>{this.props.exam.firstname} {this.props.exam.surname} ({this.props.exam.workplace})</h3>
                <br />
                <h3>{_competence.name}</h3>
                <small>{_competence.description}</small>
                <div className="estimates d-flex flex-row justify-content-around text-primary mt-4 mb-4">
                    <h5>Przewidywany czas: <strong>{Math.floor(usedSeconds/60)} min</strong></h5>
                    <h5>Przewidywany wynik: <strong>{displayedAvgScore} %</strong></h5>
                </div>
                <table className="table table-sm">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>zadanie</th>
                            <th>przypisanie do</th>
                            <th>czas</th>
                            <th>czy wybrane?</th>
                            <th>status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderedTasks}
                    </tbody>
                </table>
                <CompetenceCardComment
                    user={this.props.user}
                    exam={this.props.exam}
                    competence={_competence}
                />
            </div>
        );
    }

}
