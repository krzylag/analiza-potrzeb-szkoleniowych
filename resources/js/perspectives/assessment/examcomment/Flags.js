import React, { Component } from 'react';
import Axios from 'axios';
import FlagRadio from './FlagRadio';

export const FLAGS = {
    "flag_default":     {name: "flag_default",      text: "<strong>Domyślnie</strong> - zaliczenie zależy od zdobytych punktów"},
    "flag_forcepass":   {name: "flag_forcepass",    text: "<strong>Szkolenie uznane</strong> - zalicz niezależnie od wyniku"},
    "flag_notrelevant": {name: "flag_notrelevant",  text: "<strong>Nie podlega</strong> - temat szkolenia szary na protokole, brak wyniku procentowego"},
    "flag_hidden":      {name: "flag_hidden",       text: "<strong>Ukryte</strong> - temat szkolenia nie wyświetla się na protokole"}
};

export default class Flags extends Component {

    constructor(props) {
        super(props);
        this.state = {
            competences: {}
        };
        for (var ckey in this.props.exam.competences) {
            var competence = this.props.exam.competences[ckey];
            var cConfig = (competence.pivot.config!==null) ? JSON.parse(competence.pivot.config) : {};
            console.log(cConfig);
            this.state.competences[competence.id]={};
            var found = false;
            for (var fkey in FLAGS) {
                var flag = FLAGS[fkey];

                this.state.competences[competence.id][flag.name] = (typeof(cConfig['flag_name'])!=='undefined') ? cConfig['flag_name']==flag.name : false;
                if (this.state.competences[competence.id][flag.name]) {
                    found=true;
                }
            }
            if (!found) {
                this.state.competences[competence.id]['flag_default']=true;
            }
        }

        console.log(this.state.competences);
        this.onFlagClicked=this.onFlagClicked.bind(this);
    }

    render() {

        var renderedRows = [];
        for (var ckey in this.props.exam.competences) {
            var competence = this.props.exam.competences[ckey];
            var flagsState = this.state.competences[competence.id];
            var renderedFlags = [];
            for (var fkey in FLAGS) {
                var flagDefinition = FLAGS[fkey];
                renderedFlags.push(
                    <FlagRadio
                        key={flagDefinition.name}
                        flagState={flagsState[flagDefinition.name]}
                        flagDefinition={flagDefinition}
                        competence={competence}
                        flagClickedCallback={this.onFlagClicked}
                    />
                );
            }

            renderedRows.push(
                <tr key={competence.id}>
                    <td><strong>{competence.name}</strong><br /><small>{competence.description}</small></td>
                    <td>
                        <fieldset name={"competence-"+competence.id}>
                            {renderedFlags}
                        </fieldset>
                    </td>
                </tr>
            )
        }

        return (
            <div className="Flags">
                <table className="table table-sm">
                    <tbody>
                        {renderedRows}
                    </tbody>
                </table>
            </div>
        );
    }

    onFlagClicked(cId, fName) {
        var newCompetences = this.state.competences;
        var newCompetence = newCompetences[cId];
        for (var fkey in FLAGS) {
            var flag = FLAGS[fkey];
            if (flag.name===fName) {
                newCompetence[flag.name]=true;
            } else {
                newCompetence[flag.name]=false;
            }
        };
        Axios.post(`/api/exam/${this.props.exam.id}/set-flag`, {
            examId: this.props.exam.id,
            competenceId: cId,
            flagName: fName
        }).then((response)=>{
            //console.log(response.data);
        }).catch((error)=>{
            console.log(error);
        }).then(()=>{
            this.setState({newCompetences}, ()=>{
                this.props.onFlagUpdatedCallback();
            });
        });
    }

    getFlags() {
        return;
    }
}
