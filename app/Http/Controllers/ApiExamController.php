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

use App\Http\Traits\GetExam;
use App\Http\Traits\GetSchema;
use App\Http\Traits\GetTask;

class ApiExamController extends Controller {

    use GetExam, GetSchema, GetTask;

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

    public function getShort($examId) {
        return Exam::find($examId);
    }

    public function getComplete($examId) {
        return $this->getCompleteExam($examId);
    }

    function listUnfinishedExamsForMember($forUid) {
        return $this->getUnfinishedExamsForMember($forUid);
    }

    function listUnfinishedExams() {
        return $this->getUnfinishedExamsForMember(null);
    }

    function listExamsScoring($examIds) {
        $candidates = [];
        foreach (explode(",",$examIds) AS $id) {
            $id = (int) trim($id);
            if (!isset($candidates[$id])) $candidates[$id]=$id;
        }
        return $this->getExamsScoring($candidates);
    }

    function listUnfinishedForMember($forUid) {
        $user = User::find($forUid);
        $rawStatistics=DB::select("
            SELECT
                e.id AS eid,
                c.id AS cid,
                t.id AS tid,
                ue.user_id AS uid,
                sco.user_id AS sco_uid,
                t.computed_summary AS t_summary,
                COUNT(q.id) AS questions_count,
                COUNT(sco.score) AS scores_count,
                SUM(sco.score) AS scores_sum,
                et.id AS et_id,
                et.is_accepted AS t_accepted
            FROM exams AS e
                LEFT JOIN users_exams AS ue ON ue.exam_id=e.id
                LEFT JOIN `schemas` AS s ON s.id=e.schema_id
                LEFT JOIN schemas_competences AS sc ON sc.schema_id=s.id
                LEFT JOIN competences AS c ON c.id=sc.competence_id
                LEFT JOIN competences_tasks AS ct ON ct.competence_id=c.id
                LEFT JOIN tasks AS t ON t.id=ct.task_id
                LEFT JOIN tasks_questions AS tq ON tq.task_id=t.id
                LEFT JOIN questions AS q ON q.id=tq.question_id
                LEFT JOIN scores AS sco ON sco.exam_id=e.id AND sco.question_id=q.id
                LEFT JOIN exams_tasks AS et ON et.exam_id=e.id AND et.task_id=t.id
            WHERE e.results IS NULL
                AND ue.user_id=?
                AND ue.role='member'
            GROUP BY e.id, c.id, t.id, ue.user_id, t.computed_summary, et.is_accepted, et.id, sco.user_id
        ", array(
            $user->id
        ));
        $stat = array();
        foreach($rawStatistics AS $row) {
            $scoUID = ($row->sco_uid===null) ? 0 : intval($row->sco_uid);
            if(!isset($stat[$row->eid])) {
                $stat[$row->eid]=array();
            }
            if(!isset($stat[$row->eid][$row->cid])) {
                $stat[$row->eid][$row->cid]=array();
            }
            if(!isset($stat[$row->eid][$row->cid][$scoUID])) {
                $stat[$row->eid][$row->cid][$scoUID]=array();
                $stat[$row->eid][$row->cid][$scoUID]['all_count']=0;
                $stat[$row->eid][$row->cid][$scoUID]['accepted_count']=0;
                $stat[$row->eid][$row->cid][$scoUID]['accepted_sum']=0;
                $stat[$row->eid][$row->cid][$scoUID]['tasks']=array();
            }
            $summ=json_decode($row->t_summary);
            $row->points_max=$summ->points_max;
            $row->points_min=$summ->points_min;
            $row->points_threshold=$summ->points_threshold;
            unset($row->t_summary);
            $row->scores_sum=floatval($row->scores_sum);
            $row->t_accepted=(bool) $row->t_accepted;
            $stat[$row->eid][$row->cid][$scoUID]['all_count']++;
            if ($row->t_accepted) {
                $stat[$row->eid][$row->cid][$scoUID]['accepted_count']++;
                if (($row->points_max-$row->points_min)!=0)
                $stat[$row->eid][$row->cid][$scoUID]['accepted_sum'] += ($row->scores_sum-$row->points_min)/($row->points_max-$row->points_min);
            }
            $stat[$row->eid][$row->cid][$scoUID]['tasks'][$row->tid]=$row;
        }
        return array(
            'exams'         => $user->exams()->where('results', '=', null)->wherePivot('role', '=', 'member')->with('schema')->with('competences')->get(),
            'statistics'    => $stat
        );
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

    function deleteExam(Request $request) {
        $payload = $request->all();
        $user = Auth::user();
        $exam = Exam::find($payload['examId']);
        if ($exam->created_by==$user->id || $user->capabilities->is_admin===true) {
            $exam->delete();
            return json_encode(["result"=>true]);
        } else {
            return json_encode(["result"=>false]);
        }
    }

    function takeoverExam(Request $request) {
        $payload = $request->all();
        $user = Auth::user();
        $exam = Exam::find($payload['examId']);
        if ($exam) {
            $exam->created_by=$user->id;
            $exam->save();
            // DB::update("UPDATE users_exams SET user_id=? WHERE exam_id=? AND `role`='chairman'", [
            //     $user->id,
            //     $payload['examId']
            // ]);
            return json_encode(["result"=>true]);
        } else {
            return json_encode(["result"=>false]);
        }
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
        return $this->getTaskStructure($examId, $taskId);
    }

    public function listTasksScores($examId, $competenceId, $taskId) {
        return $this->getTaskStatistics($examId, $taskId);
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
        return ($comments->count()===0) ? null : $comments[0];
    }

    public function setTaskComment(Request $request) {
        $payload = $request->all();
        $creatorId = \Auth::user()->id;

        $existing = Taskcomment::where('exam_id','=',$payload['examId'])->where('task_id','=',$payload['taskId'])->where('user_id','=',$creatorId)->get();
        if ($existing->count()===0) {
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

    public function listCompetenceScores($examId, $competenceId) {
        $activities = DB::select('
            SELECT
                q.id AS qid,
                t.id AS tid,
                c.id AS cid,
                s.id AS sid,
                s.score AS score
            FROM questions AS q
            LEFT JOIN tasks_questions AS tq ON tq.question_id=q.id
            LEFT JOIN tasks AS t ON t.id=tq.task_id
            LEFT JOIN competences_tasks AS ct ON ct.task_id = t.id
            LEFT JOIN competences AS c ON c.id=ct.competence_id
            LEFT JOIN exams_competences AS ec ON ec.competence_id=c.id
            LEFT JOIN scores AS s ON q.id=s.question_id AND (s.exam_id = ec.exam_id OR s.exam_id IS NULL)
            WHERE ec.exam_id = ? AND c.id=?
        ', array(
            $examId,
            $competenceId,
            $examId
        ));
        $result = array();
        foreach ($activities AS $row) {
            if (!isset($result[$row->cid])) {
                $result[$row->cid]['cid'] = $row->cid;
                $result[$row->cid]['tasks'] = array();
            }
            if (!isset($result[$row->cid]['tasks'][$row->tid])) {
                $result[$row->cid]['tasks'][$row->tid]['tid'] = $row->tid;
                $result[$row->cid]['tasks'][$row->tid]['q_all'] = 0;
                $result[$row->cid]['tasks'][$row->tid]['q_filled'] = 0;
                $result[$row->cid]['tasks'][$row->tid]['ans_sum'] = 0;
            }
            $result[$row->cid]['tasks'][$row->tid]['q_all']++;
            if ($row->score!==null) {
                $result[$row->cid]['tasks'][$row->tid]['q_filled']++;
                $result[$row->cid]['tasks'][$row->tid]['ans_sum'] += floatVal($row->score);
            }

        }
        return $result[$competenceId]['tasks'];
    }


    public function finalizeExam(Request $request) {
        $payload = $request->all();
        $exam = Exam::find($payload['examId']);
        $fullExam = $this->getCompleteExam($exam->id);
        $examResults = new \stdClass();
        foreach ($fullExam['trainings'] AS $training) {
            $examResults->{$training['id']} = new \stdClass();
            $examResults->{$training['id']}->shortname=$training['shortname'];
            $examResults->{$training['id']}->fullname=$training['fullname'];
            $examResults->{$training['id']}->threshold=$training['score_threshold'];
            $examResults->{$training['id']}->avg=$training['avg_rounded'];
            $examResults->{$training['id']}->passed=($training['avg_rounded']>=$training['score_threshold']);
            $examResults->{$training['id']}->override_id=(isset($exam->config->overrides) && isset($exam->config->overrides->{$training['id']})) ? $exam->config->overrides->{$training['id']} : 0;
            $examResults->{$training['id']}->override=$examResults->{$training['id']}->override_id > 0;
        }
        $exam->results = json_encode($examResults);
        $exam->save();
        return $exam;
    }

    public function revertFinalizedExam(Request $request) {
        $payload = $request->all();
        $user = \Auth::user();
        $exam = Exam::find($payload['examId']);

        if ($exam->created_by==$user->id) {
            $exam->results = null;
            $exam->save();
        }
        return $exam;
    }

    public function setExamComment(Request $request) {
        $payload = $request->all();
        $user = \Auth::user();
        $exam = Exam::find($payload['examId']);

        if ($exam!==null && ($user->capabilities->is_admin || ($user->capabilities->can_lead && $exam->created_by===$user->id))) {
            $exam->comment = $payload['comment'];
            $exam->save();
        }
        return $exam;
    }

    public function getCompetenceComment($examId, $competenceId) {
        $competenceInstance = DB::select("SELECT id,comment FROM exams_competences WHERE exam_id=? AND competence_id=?", [
            $examId,
            $competenceId
        ]);
        if (sizeof($competenceInstance)>0) {
            $competenceInstance=reset($competenceInstance);
            $comments = ($competenceInstance->comment===null) ? new \stdClass() : json_decode($competenceInstance->comment);
            return json_encode([
                "result" => true,
                "comments" => $comments
            ]);
        } else {
            return json_encode([
                "result" => false,
                "comments" => null
            ]);
        }
    }

    public function setCompetenceComment(Request $request) {
        $payload = $request->all();
        $user = \Auth::user();
        $exam = Exam::find($payload['examId']);
        $competenceInstance = DB::select("SELECT id,comment FROM exams_competences WHERE exam_id=? AND competence_id=?", [
            $exam->id,
            $payload['competenceId']
        ]);
        if (sizeof($competenceInstance)>0) {
            $competenceInstance=reset($competenceInstance);
            $comments = ($competenceInstance->comment===null) ? new \stdClass() : json_decode($competenceInstance->comment);
            $comments->{$user->id}=$payload['comment'];
            DB::update('UPDATE exams_competences SET comment=? where id = ?', [
                json_encode($comments),
                $competenceInstance->id
            ]);
            return json_encode([
                "result" => true
            ]);
        } else {
            return json_encode([
                "result" => false
            ]);
        }
    }

    public function getExam($examId) {
        // $user = \Auth::user();
        return Exam::with('schema')->with('taskcomments')->with("competences")->find($examId);
    }

    public function getDefaultExamComment($examId) {
        $exam = Exam::find($examId);
        $comments = DB::select("
            SELECT
                ec.id, ec.competence_id, ec.comment, c.name
            FROM exams_competences AS ec
            LEFT JOIN competences AS c ON c.id=ec.competence_id
            WHERE ec.exam_id = ?", [
            $exam->id
        ]);
        $result = array();
        foreach ($comments AS $row) {
            $comment = new \stdClass();
            $comment->id=$row->competence_id;
            $comment->name=$row->name;
            $comment->users=($row->comment!==null) ? json_decode($row->comment) : new \stdClass();
            $result[$row->competence_id]= $comment;
        }
        return $result;
    }

    public function getDefaultCompetenceComment($examId, $competenceId) {
        $exam = Exam::find($examId);
        $comments = DB::select('
            SELECT
                tc.task_id AS task_id,
                CONCAT(t.order_signature, " ",t.name) AS task_name,
                tc.`comment` AS task_comment,
                c.id AS competence_id,
                c.name AS competence_name,
                tc.user_id AS user_id,
                CONCAT(u.firstname," ",u.surname) AS user_name
            FROM taskcomments AS tc
            LEFT JOIN users AS u ON u.id=tc.user_id
            LEFT JOIN tasks AS t ON t.id=tc.task_id
            LEFT JOIN competences_tasks AS ct ON ct.task_id = t.id
            LEFT JOIN competences AS c ON c.id = ct.competence_id
            LEFT JOIN exams_tasks AS et ON et.exam_id=tc.exam_id AND et.task_id=tc.task_id AND et.user_id=tc.user_id
            WHERE tc.exam_id = ? AND et.is_accepted=1 AND c.id = ?
        ', array(
            $exam->id,
            $competenceId
        ));
        $result = array();
        foreach ($comments AS $comment) {
            if (!isset($result[$comment->competence_id])) {
                $result[$comment->competence_id]=array();
                $result[$comment->competence_id]['competence_id']=$comment->competence_id;
                $result[$comment->competence_id]['competence_name']=$comment->competence_name;
                $result[$comment->competence_id]['users']=array();
            }
            if (!isset($result[$comment->competence_id]['users'][$comment->user_id])) {
                $result[$comment->competence_id]['users'][$comment->user_id]=array();
                $result[$comment->competence_id]['users'][$comment->user_id]['user_id']=$comment->user_id;
                $result[$comment->competence_id]['users'][$comment->user_id]['user_name']=$comment->user_name;
                $result[$comment->competence_id]['users'][$comment->user_id]['tasks']=array();
            }
            if (!isset($result[$comment->competence_id]['users'][$comment->user_id]['tasks'][$comment->task_id])) {
                $result[$comment->competence_id]['users'][$comment->user_id]['tasks'][$comment->task_id]['task_id']=$comment->task_id;
                $result[$comment->competence_id]['users'][$comment->user_id]['tasks'][$comment->task_id]['task_name']=$comment->task_name;
            }
            $result[$comment->competence_id]['users'][$comment->user_id]['tasks'][$comment->task_id]['task_comment']=$comment->task_comment;
        }
        return $result;
    }

    // public function setCompetenceFlag(Request $request) {
    //     $payload = $request->all();
    //     $exam = Exam::with('competences')->find($payload['examId']);
    //     $competence = $exam->competences->find($payload['competenceId']);
    //     //dd($payload);
    //     //return $competence;
    //     $config = $competence->pivot->config;
    //     if ($config==null) {
    //         $config = array();
    //     } else {
    //         $config = json_decode($config, $assoc=true);
    //     }
    //     $config['flag_name'] = $payload['flagName'];

    //     $exam->competences()->updateExistingPivot($payload['competenceId'], ['config'=>json_encode($config)]);
    //     $exam->save();

    //     return array(
    //         "result" => true
    //     );
    // }

    public function setTrainingOverride(Request $request) {
        $payload = $request->all();
        $exam = Exam::find($payload['exam_id']);

        $config = $exam->config;
        if (!isset($config->overrides)) {
            $config->overrides = new \stdClass();
        }
        $config->overrides->{$payload['training_id']} = $payload['override'];
        $exam->config=json_encode($config);
        $exam->save();
        return array(
            "result" => true
        );
    }

    public function setCompetenceUsersAssignment(Request $request) {
        $payload = $request->all();
        $usersIds = ($payload['users']==0) ? [] : explode(",", $payload['users']);

        // Ustawienie userów do wybranej kompetencji
        DB::update('UPDATE exams_competences SET allowed_users=? WHERE exam_id=? AND competence_id=?', [
            json_encode($usersIds),
            $payload['exam_id'],
            $payload['competence_id'],
        ]);

        // Zbudowanie listy IDków wszystkich userów którzy powinni widzieć egzamin w roli "member"
        $currentMembersIDs=[];
        $currentUE=DB::select("SELECT allowed_users FROM exams_competences WHERE exam_id=?", [
            $payload['exam_id']
        ]);
        foreach ($currentUE AS $row) {
            foreach (json_decode($row->allowed_users) AS $uId) {
                $currentMembersIDs[(int)$uId]=(int)$uId;
            }
        }

        // Upewnienie się że lista userów w exams_competences jest spójna z listą memberów w users_exams
        $exam = Exam::with('users')->find($payload['exam_id']);
        $users = $exam->users->keyBy('id');
        foreach ($users AS $user) {
            if($user->pivot->role=='member' && !isset($currentMembersIDs[$user->id])) {
                // $exam->users()->detach($user->id);
                DB::delete('DELETE FROM users_exams WHERE exam_id=? AND user_id=? AND `role`=?', [
                    $exam->id,
                    $user->id,
                    'member'
                ]);
            }
        }
        foreach ($currentMembersIDs AS $mId) {
            if (!isset($users[$mId]) || $users[$mId]->pivot->role!=='member') {
                $exam->users()->attach($mId, ['role' => 'member']);
            }
        }

        return array(
            "result" => true
        );
    }

}
