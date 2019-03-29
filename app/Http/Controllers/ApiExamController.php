<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Exam;
use App\User;

class ApiExamController extends Controller {

    function createNew(Request $request) {
        $payload = $request->all();
        $creatorId = \Auth::user()->id;

        $exam = new Exam();
        $exam->schema_id = $payload['schemaId'];
        $exam->firstname = $payload['firstname'];
        $exam->surname = $payload['surname'];
        $exam->workplace = $payload['workplace'];
        $exam->date = $payload['date'];
        $exam->city = $payload['city'];
        $exam->created_by = $creatorId;

        $exam->save();

        $exam->users()->attach(array(
            $creatorId => array(
                'role' => 'chairman'
            )
        ));

        $allExaminers = array();

        foreach(array_keys($payload['examiners']) AS $competKey) {
            foreach($payload['examiners'][$competKey] AS $userId) {
                $allExaminers[$userId]=$userId;
            }
            $exam->competences()->attach(array(
                intVal($competKey) => array(
                    'allowed_users' => json_encode($payload['examiners'][$competKey]) )
                )
            );
        }
        foreach($allExaminers AS $userId) {
            $exam->users()->attach(array(
                $userId => array(
                    'role' => 'member'
                )
            ));
        }
}

    function listUnfinishedForMember($forUid) {
        $user = User::find($forUid);
        $exams = $user->exams()->where('results', '=', null)->wherePivot('role', '=', 'member')->with('schema')->with('competences')->get();
        return $exams;
    }


    function listAcceptedTasks($examId, $competenceId) {
        $exam = Exam::find($examId);
        $competence = $exam->competences()->where('competences.id', '=', $competenceId)->get()->find($competenceId);
        $tasks = $competence->tasks()->with('exams')->get();

        return $tasks;

    }

    function toggleAcceptedTask(Request $request) {
        $payload = $request->all();
        $user = \Auth::user();

        $exam = Exam::find($payload['examId']);
        $competence = $exam->competences()->where('competences.id', '=', $payload['competenceId'])->get()->find($payload['competenceId']);
        $task = $competence->tasks()->get()->find($payload['taskId']);

        $examConnected = $task->exams()->wherePivot('user_id', '=', $user->id)->find($payload['examId']);
        if ($examConnected===null) {
            $newVal = 1;
            $exam->tasks()->attach(array(
                $payload['taskId'] => array(
                    'user_id' => $user->id,
                    'is_accepted' => $newVal
                )
            ));
        } else {
            $oldVal = ($examConnected->tasks()->wherePivot('user_id', '=', $user->id)->find($payload['taskId']))->pivot->is_accepted;
            $newVal = (($oldVal+1)%2);
            $examConnected->tasks()->where('id', '=', $payload['taskId'])->wherePivot('user_id', '=', $user->id)->updateExistingPivot($payload['taskId'], array(
                'is_accepted' => $newVal
            ));
        }

        return array(
            'result' => true,
            'new_state' => $newVal
        );

    }
}
