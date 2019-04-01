<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Exam;
use App\User;
use App\Competence;
use Illuminate\Support\Facades\Auth;
use App\Task;
use App\Question;
use App\Score;
use App\Taskcomment;

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

    // Zwraca bieżącą listę zadań używanych/nieużywanych do końcowej oceny,
    //   dla danego egzaminu / kompetencji / usera
    function listAcceptedTasks($examId, $competenceId) {
        $result = array();
        $competence = Competence::find($competenceId);
        $tasksIds = array();
        $tasks = $competence->tasks()->get();
        foreach ($tasks AS $task) {
            $tasksIds[]=$task->id;
            $result[$task->id] = false;
        }
        $actives = DB::select('SELECT * FROM exams_tasks WHERE exam_id = ? AND task_id IN ('.join(',',$tasksIds).') AND user_id = ? AND is_accepted=1', array(
            $examId,
            Auth::user()->id
        ));
        foreach ($actives AS $active) {
                $result[$active->task_id]=(bool) $active->is_accepted;
        }
        return $result;

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

    public function listTasksDictionary($examId, $competenceId, $taskId) {
        $task = Task::with('questions')->find($taskId);
        return $task;
    }

    public function listQuestionScores($examId, $competenceId, $taskId) {
        $creatorId = \Auth::user()->id;
        $result = array();
        $task = Task::with('questions')->find($taskId);
        $questionsIds = array();
        foreach($task['questions'] AS $question) {
            $questionsIds[]=$question->id;
            $result[$question->id]=null;
        }
        $existing = Score::where('exam_id','=',$examId)->where('user_id','=',$creatorId)->whereIn('question_id', $questionsIds)->get();
        foreach ($existing AS $score) {
            $result[$score['question_id']]=$score['score'];
        }
        return $result;
    }

    public function setQuestionScore(Request $request) {
        $payload = $request->all();
        $creatorId = \Auth::user()->id;
        //dd($payload);

        $existing = Score::where('exam_id','=',$payload['examId'])->where('question_id','=',$payload['questionId'])->where('user_id','=',$creatorId)->get();
        if (sizeof($existing)==0) {
            $score = new Score();
            $score->exam_id=intval($payload['examId']);
            $score->question_id=intval($payload['questionId']);
            $score->user_id=$creatorId;
            $score->score=floatval($payload['value']);
            $score->save();
        } else {
            $score = $existing[0];
            $score->score=floatval($payload['value']);
            $score->save();
        }
        return $score;
    }

    public function getTaskComment($examId, $competenceId, $taskId) {
        $creatorId = \Auth::user()->id;
        $comments = Taskcomment::where('exam_id','=',$examId)->where('task_id','=',$taskId)->where('user_id','=',$creatorId)->get();
        return (empty($comments)) ? null : $comments[0];
    }

    public function setTaskComment(Request $request) {
        $payload = $request->all();
        $creatorId = \Auth::user()->id;

        $existing = Taskcomment::where('exam_id','=',$payload['examId'])->where('task_id','=',$payload['taskId'])->where('user_id','=',$creatorId)->get();
        if (sizeof($existing)==0) {
            $tc = new Taskcomment();
            $tc->exam_id = $payload['examId'];
            $tc->task_id = $payload['taskId'];
            $tc->user_id = $creatorId;
            $tc->comment = $payload['text'];
            $tc->save();
        } else {
            $tc = $existing[0];
            $tc->comment = $payload['text'];
            $tc->save();
        }
        return $tc;
    }
}
