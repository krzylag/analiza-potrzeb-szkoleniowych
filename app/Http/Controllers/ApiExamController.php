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
        $user = \Auth::user();
        $exam = Exam::find($payload['examId']);
        if ($exam->created_by==$user->id) {
            $examStats = $this->listUnfinishedForMember($user->id);
            $result = array();
            foreach(array_keys($examStats['statistics'][$exam->id]) AS $competId) {
                if (!isset($result[$competId])) {
                    $result[$competId]['competence_id']=intval($competId);
                    $result[$competId]['count']=0;
                    $result[$competId]['sum']=0;
                    $result[$competId]['avg']=0;
                }
                foreach($examStats['statistics'][$payload['examId']][$competId] AS $byUser) {
                    $result[$competId]['count'] += $byUser['accepted_count'];
                    $result[$competId]['sum'] += $byUser['accepted_sum'];
                    $result[$competId]['avg'] = ($result[$competId]['count']>0) ? $result[$competId]['sum']/$result[$competId]['count'] : 0;
                }
            }
            $exam->results = json_encode($result);
            $exam->save();
        }
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

    public function getExam($examId) {
        // $user = \Auth::user();
        return Exam::with('schema')->with('taskcomments')->find($examId);
    }

    public function getDefaultExamComment($examId) {
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
            WHERE tc.exam_id = ? AND et.is_accepted=1
        ', array(
            $exam->id
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
}
