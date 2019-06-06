<?php

namespace App\Http\Traits;

use App\User;
use App\Exam;
use Illuminate\Support\Facades\DB;

trait GetExam {

    public function getUnfinishedExamsForMember($forUid) {
        $user = User::find($forUid);
        $result = [];
        foreach ( $user->exams()->with('competences')->where('results', '=', null)->get() AS $exam) {
            if (!isset($result[$exam->id])){
                $result[$exam->id] = [
                    "id"                    => $exam->id,
                    "schema_id"             => $exam->schema_id,
                    "config"                => $exam->config,
                    "created_at"            => $exam->created_at,
                    "created_by"            => $exam->created_by,
                    "date"                  => $exam->date,
                    "city"                  => $exam->city,
                    "firstname"             => $exam->firstname,
                    "surname"               => $exam->surname,
                    "workplace"             => $exam->workplace,
                    "roles"                 => [
                        "chairman"              => false,
                        "member"                => false
                    ],
                    "allowed_competences"   => [],
                    "competences_users"     => []
                ];
            }
            $result[$exam->id]['roles'][$exam->pivot->role]=true;
            foreach ($exam->competences AS $competence) {
                $result[$exam->id]['allowed_competences'][$competence->id]=false;
                $allowedUsers = json_decode($competence->pivot->allowed_users);
                foreach($allowedUsers AS $allowedUserId) {
                    if ($allowedUserId==$user->id) {
                        $result[$exam->id]['allowed_competences'][$competence->id]=true;
                    }
                    $result[$exam->id]['competences_users'][$competence->id][$allowedUserId]=$allowedUserId;
                }

            }
        }
        return $result;
    }

    public function getExamsScoring($examsIds) {
        $exams = Exam::whereIn('id', $examsIds)->get();
        $result=[];
        $examsIds=[];
        foreach ($exams AS $exam) {
            $examsIds[$exam->id]=$exam->id;
        }
        $rawStatistics=DB::select("
            SELECT
                e.id AS e_id,
                s.id AS s_id,
                s.fullname AS s_name,
                c.id AS c_id,
                c.`name` AS c_name,
                ec.config AS ec_config,
                t.id AS t_id,
                t.order_signature AS t_order,
                t.`name` AS t_name,
                t.score_threshold AS t_threshold,
                u.id AS u_id,
                q.id AS q_id,
                q.`text` AS q_name,
                q.score_min AS q_min,
                q.score_max AS q_max,
                q.score_step AS q_step,
                sco.score AS score,
                sco.user_id AS score_uid,
                IF(ISNULL(u.id), null, CONCAT(u.firstname,' ',u.surname)) AS score_username,
                tc.user_id AS comment_uid,
                tc.comment AS comment,
                et.is_accepted AS t_accepted
            FROM
                exams AS e
                LEFT JOIN `schemas` AS s ON s.id=e.schema_id
                LEFT JOIN schemas_competences AS sc ON sc.schema_id=s.id
                LEFT JOIN competences AS c ON c.id=sc.competence_id
                LEFT JOIN competences_tasks AS ct ON ct.competence_id=c.id
                LEFT JOIN tasks AS t ON t.id=ct.task_id
                LEFT JOIN tasks_questions AS tq ON tq.task_id=t.id
                LEFT JOIN questions AS q ON q.id=tq.question_id
                LEFT JOIN scores AS sco ON sco.question_id=q.id AND sco.exam_id=e.id
                LEFT JOIN exams_tasks AS et ON et.exam_id=e.id AND et.task_id=t.id
                LEFT JOIN users AS u ON u.id=sco.user_id
                LEFT JOIN taskcomments AS tc ON tc.exam_id=e.id AND tc.task_id=t.id
                LEFT JOIN exams_competences AS ec ON ec.exam_id=e.id AND ec.competence_id=c.id
            WHERE
                e.id IN (".implode(", ",$examsIds).")
            ORDER BY
                t.order_signature ASC, t.id ASC
        ");

        foreach ($rawStatistics AS $row) {
            if (!isset($result[$row->e_id])) {
                $result[$row->e_id]=[
                    "id"        => $row->e_id,
                    "tasks"     => []
                ];
            }
            if (!isset($result[$row->e_id]['tasks'][$row->t_id])) {
                $result[$row->e_id]['tasks'][$row->t_id]=[
                    "id"            => $row->t_id,
                    "threshold"     => (float) $row->t_threshold,
                    "accepted"      => ($row->t_accepted==true),
                    "sum"           => 0,
                    "count"         => 0,
                    "count_max"     => 0,
                    "avg"           => null,
                    "questions"     => []
                ];
            }
            if (!isset($result[$row->e_id]['tasks'][$row->t_id]['questions'][$row->q_id])) {
                $result[$row->e_id]['tasks'][$row->t_id]['questions'][$row->q_id]=[
                    "id"            => $row->q_id,
                    "min"           => (float) $row->q_min,
                    "max"           => (float) $row->q_max,
                    "step"          => (float) $row->q_step,
                    "sum"           => 0,
                    "count"         => 0,
                    "avg"           => null,
                    "users"         => []
                ];
                $result[$row->e_id]['tasks'][$row->t_id]['count_max']++;
            }
            if ($row->u_id!==null) {
                $result[$row->e_id]['tasks'][$row->t_id]['questions'][$row->q_id]['users'][$row->u_id]=[
                    "id"            => $row->u_id,
                    "score"         => (float) $row->score
                ];
                $result[$row->e_id]['tasks'][$row->t_id]['questions'][$row->q_id]['sum'] += (float) $row->score;
                $result[$row->e_id]['tasks'][$row->t_id]['questions'][$row->q_id]['count']++;
            }
        }

        // Obliczenie średnich ocen tasków na podstawie średnich ocen pytań
        foreach ($result AS $eId => $exam) {
            foreach ($exam['tasks'] AS $tId => $task) {
                foreach ($task['questions'] AS $qId => $question) {
                    if ($question['count'] > 0) {
                        $result[$eId]['tasks'][$tId]['questions'][$qId]['avg'] = $question['sum'] / $question['count'];
                        $result[$eId]['tasks'][$tId]['sum'] += $result[$eId]['tasks'][$tId]['questions'][$qId]['avg'];
                        $result[$eId]['tasks'][$tId]['count']++;
                    }
                }
                if ($result[$eId]['tasks'][$tId]['count'] > 0) {
                    $result[$eId]['tasks'][$tId]['avg'] = $result[$eId]['tasks'][$tId]['sum'] / $result[$eId]['tasks'][$tId]['count'];
                }
            }
        }
        return $result;
    }

}
