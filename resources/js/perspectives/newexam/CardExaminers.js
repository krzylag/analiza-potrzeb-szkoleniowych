import React, { Component } from 'react';
import Examinerselect from './Examinerselect';

export default class CardExaminers extends Component {

    render() {

        var cardContents;

        if (this.props.schemaOptionSelected===null) {

            cardContents = 'Wybierz schemat egzaminu powyżej, aby móc przydzielać egzaminatorów.';

        } else if (typeof(this.props.schemasList[this.props.schemaOptionSelected.value])==='undefined') {

            cardContents = 'Wybrany schemat nie istnieje. Coś poszło nie tak, odśwież stronę.';

        } else {

            var schema = this.props.schemasList[this.props.schemaOptionSelected.value];
            var renderAttachExaminers = [];
            for (var cKey in schema.competences) {
                var competence = schema.competences[cKey];
                var thisExaminerOptionsSelected = (typeof(this.props.examinersOptionsSelected[competence.id])!=='undefined') ? this.props.examinersOptionsSelected[competence.id] : [];
                renderAttachExaminers.push(
                    <Examinerselect
                        key={competence.id}
                        usersList={this.props.usersList}
                        competence={competence}
                        selected={thisExaminerOptionsSelected}
                        onExaminerChangedCallback={this.props.onExaminerChangedCallback}
                    />
                );
                cardContents = (
                    <div>
                        {renderAttachExaminers}
                        <small>
                            Pola wielokrotnego wyboru. Możesz wybrać więcej niż jednego egzaminatora do każdej kompetencji.
                            To pole steruje wyłącznie widocznością egzaminu dla poszczególnych osób. Jeśli jakiś egzaminator w ogóle nie przyzna ocen,
                            to nie wpłynie na końcową średnią uczestnika.
                        </small>
                    </div>
                );
            }

        }

        return (
            <div className="CardExaminers card mt-4">
                <h5 className="card-header">Egzaminatorzy:</h5>
                <div className="card-body">
                    {cardContents}
                </div>
            </div>
        );
    }

}
