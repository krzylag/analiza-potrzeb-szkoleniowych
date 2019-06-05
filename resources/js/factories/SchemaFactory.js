
export default function makeSchema(payload) {

    for (var tId in payload.tasks) {
        for (var qId in payload.tasks[tId].questions) {
            payload.tasks[tId].questions[qId]=payload.questions[qId];
        }
    }

    for (var cId in payload.competences) {
        for (var tId in payload.competences[cId].tasks) {
            payload.competences[cId].tasks[tId]=payload.tasks[tId];
        }
    }

    return payload;
}
