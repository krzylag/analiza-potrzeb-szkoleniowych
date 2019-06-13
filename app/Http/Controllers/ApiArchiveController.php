<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Http\Traits\GetExam;
use App\Exam;
use PDF;

class ApiArchiveController extends Controller {

    use GetExam;

    public function listFinishedExams(Request $request) {
        $filters = $request->query('filters');
        if ($filters!=='' && $filters!==null) $filters = json_decode($filters);

        if (isset($filters->not_before) && $filters->not_before !==null && $filters->not_before!=='') {
            $notBefore = new \DateTime($filters->not_before);
        } else {
            $notBefore=null;
        }

        if (isset($filters->not_after) && $filters->not_after !==null && $filters->not_after!=='') {
            $notAfter = new \DateTime($filters->not_after);
        } else {
            $notAfter=null;
        }

        if (isset($filters->surname) && $filters->surname !==null && $filters->surname!=='') {
            $surname = $filters->surname;
        } else {
            $surname=null;
        }

        if (isset($filters->schema_name) && $filters->schema_name !==null && $filters->schema_name!=='') {
            $schemaName = $filters->schema_name;
        } else {
            $schemaName=null;
        }

        if (isset($filters->only_failed) && $filters->only_failed==true) {
            $onlyFailed=true;
        } else {
            $onlyFailed=false;
        }

        if (isset($filters->only_succeed) && $filters->only_succeed==true) {
            $onlySucceeded=true;
        } else {
            $onlySucceeded=false;
        }

        $exams = Exam::with(['schema' => function($query) {
                $query->withTrashed();
            }])
            ->where('results', '<>', null)
            ->when($notBefore, function($query) use ($notBefore) {
                $query->where('date', '>=', $notBefore->format("Y-m-d"));
            })
            ->when($notAfter, function($query) use ($notAfter) {
                $query->where('date', '<=', $notAfter->format("Y-m-d"));
            })
            ->when($surname, function($query) use ($surname) {
                $query->where('surname', 'like', '%'.$surname.'%')->orWhere('firstname', 'like', '%'.$surname.'%');
            })->when($schemaName, function($query) use ($schemaName) {
                $query->whereHas('schema', function($queryInner) use ($schemaName) {
                    $queryInner->where('shortname', 'like', '%'.$schemaName.'%');
                });
            })
            ->get();

        foreach ($exams AS $examKey => $exam) {
            if ($onlyFailed) {
                $hasFailedParts = false;
                foreach($exam->results AS $tResult) {
                    if ($tResult['passed']==false && $tResult['override']==false) {
                        $hasFailedParts=true;
                        break;
                    }
                }
                if (!$hasFailedParts) $exams->forget($examKey);
            }
            if ($onlySucceeded) {
                $hasFailedParts = false;
                foreach($exam->results AS $tResult) {
                    if ($tResult['passed']==false && $tResult['override']==false) {
                        $hasFailedParts=true;
                        break;
                    }
                }
                if ($hasFailedParts) $exams->forget($examKey);
            }
        }
        return $exams;

    }


    private function getExamStatisticsArray($examId) {
        $query = "
            SELECT
                e.id AS e_id,
                s.id AS s_id,
                s.fullname AS s_name,
                c.id AS c_id,
                c.`name` AS c_name,
                c.score_threshold AS c_threshold,
                ec.config AS ec_config,
                t.id AS t_id,
                t.order_signature AS t_order,
                t.`name` AS t_name,
                t.score_threshold AS t_threshold,
                q.id AS q_id,
                q.`text` AS q_name,
                q.score_min AS q_min,
                q.score_max AS q_max,
                sco.score AS score,
                sco.user_id AS score_uid,
                IF(ISNULL(u.id), null, CONCAT(u.firstname,' ',u.surname)) AS score_username,
                tc.user_id AS comment_uid,
                tc.comment AS comment
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
                e.id = ?
                AND et.is_accepted = 1
            ORDER BY
                t.order_signature ASC, t.id ASC
        ";
        $params = array(
            $examId
        );
        $result = array();
        foreach (DB::select($query, $params) AS $row) {
            if (!isset($result['id'])) {
                $result['id']=$row->s_id;
                $result['name']=$row->s_name;
                $result['competences']=array();
            }
            if (!isset($result['competences'][$row->c_id])) {
                $result['competences'][$row->c_id]['id']=$row->c_id;
                $result['competences'][$row->c_id]['order']=sizeof($result['competences']);
                $result['competences'][$row->c_id]['name']=$row->c_name;
                $result['competences'][$row->c_id]['threshold']=floatval($row->c_threshold);
                $result['competences'][$row->c_id]['config']=($row->ec_config==null) ? array() : json_decode($row->ec_config, $assoc=true);
                $result['competences'][$row->c_id]['users_taskpercents_sums']=array();
                $result['competences'][$row->c_id]['taskpercents_sum']=0;
                $result['competences'][$row->c_id]['taskpercents_count']=0;
                $result['competences'][$row->c_id]['tasks']=array();
                $result['competences'][$row->c_id]['users']=array();
            }
            if (!isset($result['competences'][$row->c_id]['users_taskpercents_sums'][$row->score_uid]) && $row->score_uid!=null) {
                $result['competences'][$row->c_id]['users_taskpercents_sums'][$row->score_uid]=0;
            }
            if (!isset($result['competences'][$row->c_id]['tasks'][$row->t_id])) {
                $result['competences'][$row->c_id]['tasks'][$row->t_id]['id']=$row->t_id;
                $result['competences'][$row->c_id]['tasks'][$row->t_id]['order']=$row->t_order;
                $result['competences'][$row->c_id]['tasks'][$row->t_id]['name']=$row->t_name;
                $result['competences'][$row->c_id]['tasks'][$row->t_id]['threshold']=$row->t_threshold;
                $result['competences'][$row->c_id]['tasks'][$row->t_id]['users_comments']=array();
                $result['competences'][$row->c_id]['tasks'][$row->t_id]['users_scores_sums']=array();
                $result['competences'][$row->c_id]['tasks'][$row->t_id]['scores_sum']=0;
                $result['competences'][$row->c_id]['tasks'][$row->t_id]['scores_max']=0;
                $result['competences'][$row->c_id]['tasks'][$row->t_id]['scores_count']=0;
                $result['competences'][$row->c_id]['tasks'][$row->t_id]['questions_count']=0;
                $result['competences'][$row->c_id]['tasks'][$row->t_id]['questions']=array();
                $result['competences'][$row->c_id]['taskpercents_count']++;
            }
            if (!isset($result['competences'][$row->c_id]['tasks'][$row->t_id]['users_comments'][$row->comment_uid]) && $row->comment!=null) {
                $result['competences'][$row->c_id]['tasks'][$row->t_id]['users_comments'][$row->comment_uid]=array(
                    'uid' => $row->comment_uid,
                    'comment' => $row->comment
                );
            }
            if (!isset($result['competences'][$row->c_id]['tasks'][$row->t_id]['users_scores_sums'][$row->score_uid]) && $row->score_uid!=null) {
                $result['competences'][$row->c_id]['tasks'][$row->t_id]['users_scores_sums'][$row->score_uid]=0;
            }
            if (!isset($result['competences'][$row->c_id]['tasks'][$row->t_id]['questions'][$row->q_id])) {
                $result['competences'][$row->c_id]['tasks'][$row->t_id]['questions'][$row->q_id]['id']=$row->q_id;
                $result['competences'][$row->c_id]['tasks'][$row->t_id]['questions'][$row->q_id]['order']=sizeof($result['competences'][$row->c_id]['tasks'][$row->t_id]['questions']);
                $result['competences'][$row->c_id]['tasks'][$row->t_id]['questions'][$row->q_id]['name']=$row->q_name;
                $result['competences'][$row->c_id]['tasks'][$row->t_id]['questions'][$row->q_id]['min']=floatval($row->q_min);
                $result['competences'][$row->c_id]['tasks'][$row->t_id]['questions'][$row->q_id]['max']=floatval($row->q_max);
                $result['competences'][$row->c_id]['tasks'][$row->t_id]['questions'][$row->q_id]['users_scores']=array();
                $result['competences'][$row->c_id]['tasks'][$row->t_id]['questions_count']++;
                $result['competences'][$row->c_id]['tasks'][$row->t_id]['scores_max'] += (floatval($row->q_max));
            }
            if ($row->score!=null && $row->score_uid!=null) {
                $result['competences'][$row->c_id]['tasks'][$row->t_id]['questions'][$row->q_id]['users_scores'][$row->score_uid]=floatval($row->score);
                $result['competences'][$row->c_id]['tasks'][$row->t_id]['users_scores_sums'][$row->score_uid] += floatval($row->score);
                $result['competences'][$row->c_id]['tasks'][$row->t_id]['scores_count']++;
            }
            if (!isset($result['competences'][$row->c_id]['users'][$row->score_uid]) && $row->score_uid!=null) {
                $result['competences'][$row->c_id]['users'][$row->score_uid]['id']=$row->score_uid;
                $result['competences'][$row->c_id]['users'][$row->score_uid]['name']=$row->score_username;
            }
        }
        foreach($result['competences'] AS &$competence) {
            foreach($competence['tasks'] AS $task) {
                foreach(array_keys($task['users_scores_sums']) AS $uid) {
                    if ($task['users_scores_sums'][$uid]>0) {
                        $competence['taskpercents_sum'] += ($task['users_scores_sums'][$uid] / $task['questions_count']);
                        $competence['users_taskpercents_sums'][$uid] += ($task['users_scores_sums'][$uid] / $task['questions_count']);
                        $competence['tasks'][$task['id']]['scores_sum'] += $task['users_scores_sums'][$uid];
                    }
                }
            }
        }
        //dd($result);
        return $result;
    }

    public function getReportData($examId) {
        // $exam = Exam::with('schema')->find($examId);
        // return array(
        //     "exam_city" => $exam->city,
        //     "exam_date" => (new \DateTime($exam->created_at))->format("Y-m-d"),
        //     "exam_comment" => $exam->comment,
        //     "exam_header_text" => $exam->schema->fullname,
        //     "examinee_name" => $exam->surname." ".$exam->firstname,
        //     "examinee_workplace" => $exam->workplace,
        //     "details" => $this->getExamStatisticsArray($examId)
        // );
        return $this->getCompleteExamStructurized($examId);
    }

    public function htmlToPdf($examId, $type) {
        $exam = Exam::find($examId);
        $user = \Auth::user();
        if (!$user->capabilities->can_search) {
            return "Nie masz uprawnień dostępu do archiwum.";
        } else if (!empty($exam)) {
            $reportData = $this->getCompleteExamStructurized($examId);
            $reportData['report_type'] = $type;
            $pdf = PDF::loadView("reports.default", $reportData);
            $date = (\DateTime::createFromFormat("Y-m-d H:i:s", $exam->created_at))->format('Y-m-d');
            $fname =  preg_replace("/[^a-zA-Z0-9ĄĆĘÓŚŹŻąćęóśźż_\.\-]/", "", $exam->surname."_".$exam->firstname."_".$date.".pdf");
            return $pdf->stream($fname);
        } else {
            return "Nie ma takiego egzaminu";
        }

    }

    public function htmlToHtml($examId, $type) {
        $exam = Exam::find($examId);
        $user = \Auth::user();
        if (!$user->capabilities->can_search) {
            return "Nie masz uprawnień dostępu do archiwum.";
        } else if (!empty($exam)) {
            $reportData = $this->getCompleteExamStructurized($examId);
            $reportData['report_type'] = $type;
            $rendered = view("reports.default", $reportData);
            return $rendered;
        } else {
            return "Nie ma takiego egzaminu";
        }

    }
}
