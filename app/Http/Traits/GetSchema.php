<?php

namespace App\Http\Traits;
use App\Schema;
use Illuminate\Support\Facades\DB;

trait GetSchema {

    public function getSchemaStructureArray($schemaId) {
        $result = [];

        $input = Schema::with('competences')->with('trainings')->find($schemaId);

        foreach($input AS $schema) {
            $result[$schema->id] = [
                "id"            => $schema->id,
                "fullname"      => $schema->fullname,
                "shortname"     => $schema->shortname,
                "created_by"    => $schema->created_by,
                "created_at"    => $schema->created_at,
                "deleted_by"    => $schema->deleted_by,
                "deleted_at"    => $schema->deleted_at,
                "competences"   => [],
                "trainings"     => [],
                "tasks"         => []
            ];
            foreach ($schema['competences'] AS $competence) {
                $result[$schema->id]['competences'][$competence->id]=[
                    "id"                => $competence->id,
                    "order_signature"   => $competence->order_signature,
                    "name"              => $competence->name,
                    "description"       => $competence->description,
                    "tasks"             => []
                ];
                foreach($competence['tasks'] AS $task) {
                    $result[$schema->id]['competences'][$competence->id]['tasks'][$task->id]=$task->id;

                }
            }
            foreach ($schema['trainings'] AS $training) {
                $result[$schema->id]['trainings'][$training->id]=[
                    "id"                => $training->id,
                    "order_signature"   => $training->order_signature,
                    "shortname"         => $training->shortname,
                    "fullname"          => $training->fullname,
                    "score_threshold"   => (float) $training->score_threshold,
                    "tasks"             => []
                ];
                foreach($competence['tasks'] AS $task) {
                    $result[$schema->id]['trainings'][$training->id]['tasks'][$task->id]=$task->id;
                }
            }
        }



        return $result;

        $queryFirst = '
            SELECT
                s.fullname AS s_fullname, s.shortname AS s_shortname, s.created_by AS s_created_by, s.created_at AS s_created_at, s.deleted_by AS s_deleted_by, s.deleted_at AS s_deleted_at,
                c.id AS c_id, c.name AS c_name, c.description AS c_description, c.order_signature AS c_order_signature,
                t.id AS t_id, t.shortname AS t_shortname, t.fullname AS t_fullname, t.score_threshold AS t_score_threshold, t.order_signature AS t_order_signature,
                ct.task_id AS t_id_competence,
                tt.task_id AS t_id_training
            FROM
                `schemas` AS s
                LEFT JOIN `schemas_competences` AS sc ON sc.schema_id=s.id
                LEFT JOIN `competences` AS c ON c.id=sc.competence_id
                LEFT JOIN `competences_tasks` AS ct ON ct.competence_id=c.id
                LEFT JOIN `schemas_trainings` AS st ON st.schema_id=s.id
                LEFT JOIN `trainings` AS t ON t.id=st.training_id
                LEFT JOIN `trainings_tasks` AS tt ON tt.training_id=t.id
            WHERE s.id = ?
        ';
        $usedTrainingsIds = [];
        foreach (DB::select($queryFirst, [ $schemaId ]) AS $row) {
            if (!isset($result['id'])) {
                $result=[
                    "id"            => (int) $schemaId,
                    "shortname"     => $row->s_shortname,
                    "fullname"      => $row->s_fullname,
                    "created_by"    => $row->s_created_by,
                    "created_at"    => $row->s_created_at,
                    "deleted_by"    => $row->s_deleted_by,
                    "deleted_at"    => $row->s_deleted_at,
                    "competences"   => [],
                    "trainings"     => [],
                    "tasks"         => []
                ];
            }
            if (!isset($result['competences'][$row->c_id]) && $row->c_id!=null) {
                $result['competences'][$row->c_id]=[
                    "id"                => (int) $row->c_id,
                    "order_signature"   => $row->c_order_signature,
                    "name"              => $row->c_name,
                    "description"       => $row->c_description,
                    "tasks"             => []
                ];
            }
            if (!isset($result['trainings'][$row->t_id]) && $row->t_id!=null) {
                $result['trainings'][$row->t_id]=[
                    "id"                => (int) $row->t_id,
                    "order_signature"   => $row->t_order_signature,
                    "shortname"         => $row->t_shortname,
                    "fullname"          => $row->t_fullname,
                    "score_threshold"   => (float) $row->t_score_threshold,
                    "tasks"             => []
                ];
            }
            $result['competences'][$row->c_id]['tasks'][$row->t_id_competence]=$row->t_id_competence;
            $result['trainings'][$row->t_id]['tasks'][$row->t_id_training]=$row->t_id_training;
            if (!isset($usedTrainingsIds[$row->t_id_competence])) $usedTrainingsIds[$row->t_id_competence]=$row->t_id_competence;
            if (!isset($usedTrainingsIds[$row->t_id_training])) $usedTrainingsIds[$row->t_id_training]=$row->t_id_training;
        }
        $queryTasks = "
            SELECT
                t.id AS t_id, t.order_signature AS t_order_signature, t.grouping_hash AS t_grouping_hash, t.name AS t_name,
                t.description AS t_description, t.table_header AS t_table_header, t.can_comment AS t_can_comment,
                t.time_available AS t_time_available, t.score_threshold AS t_score_threshold,
                q.id AS q_id, q.text AS q_text, q.hint AS q_hint, q.order_signature AS q_order_signature,
                q.score_min AS q_score_min, q.score_max AS q_score_max, q.score_step AS q_score_step
            FROM
                tasks AS t
                LEFT JOIN tasks_questions AS tq ON tq.task_id=t.id
                LEFT JOIN questions AS q ON q.id=tq.question_id
            WHERE t.id IN (".implode(", ", $usedTrainingsIds).")
        ";
        foreach (DB::select($queryTasks) AS $row) {
            if (!isset($result['tasks'][$row->t_id])) {
                $result['tasks'][$row->t_id] = [
                    "id"                => (int) $row->t_id,
                    "order_signature"   => $row->t_order_signature,
                    "grouping_hash"     => $row->t_grouping_hash,
                    "name"              => $row->t_name,
                    "description"       => $row->t_description,
                    "table_header"      => $row->t_table_header,
                    "can_comment"       => (int) $row->t_can_comment,
                    "time_available"    => $row->t_time_available,
                    "score_threshold"   => (float) $row->t_score_threshold,
                    "questions"         => []
                ];
            }
            $result['tasks'][$row->t_id]['questions'][$row->q_id]=[
                "id"                => (int) $row->q_id,
                "order_signature"   => $row->q_order_signature,
                "text"              => $row->q_text,
                "hint"              => $row->q_hint,
                "score_min"         => (float) $row->q_score_min,
                "score_max"         => (float) $row->q_score_max,
                "score_step"        => (float) $row->q_score_step,
            ];
        }
        return $result;
    }


    public function getSchemasListArray($includeDeleted=true) {
        $result = [];
        if ($includeDeleted===true) {
            $input = Schema::withTrashed()->with('competences')->with('trainings')->get();
        } else {
            $input = Schema::with('competences')->with('trainings')->get();
        }
        foreach($input AS $schema) {
            $result[$schema->id] = [
                "id"            => $schema->id,
                "fullname"      => $schema->fullname,
                "shortname"     => $schema->shortname,
                "created_by"    => $schema->created_by,
                "created_at"    => $schema->created_at,
                "deleted_by"    => $schema->deleted_by,
                "deleted_at"    => $schema->deleted_at,
                "competences"   => [],
                "trainings"     => []
            ];
            foreach ($schema['competences'] AS $competence) {
                $result[$schema->id]['competences'][$competence->id]=[
                    "id"                => $competence->id,
                    "order_signature"   => $competence->order_signature,
                    "name"              => $competence->name,
                    "description"       => $competence->description,
                    "task_count"        => $competence['tasks']->count()
                ];
            }
            foreach ($schema['trainings'] AS $training) {
                $result[$schema->id]['trainings'][$training->id]=[
                    "id"                => $training->id,
                    "order_signature"   => $training->order_signature,
                    "shortname"         => $training->shortname,
                    "fullname"          => $training->fullname,
                    "score_threshold"   => (float) $training->score_threshold,
                    "task_count"        => $training['tasks']->count()
                ];
            }
        }

        return $result;

        $query = "
            SELECT
                s.id AS s_id, s.fullname AS s_fullname, s.shortname AS s_shortname,
                s.created_by AS s_created_by, s.created_at AS s_created_at, s.deleted_at AS s_deleted_at, s.deleted_by AS s_deleted_by,
                c.id AS c_id, c.order_signature AS c_order_signature, c.name AS c_name, c.description AS c_description,
                t.id AS t_id, t.order_signature AS t_order_signature, t.shortname AS t_shortname, t.fullname AS t_fullname, t.score_threshold AS t_score_threshold,
                COUNT(ct.id) AS ct_count,
                COUNT(tt.id) AS tt_count
            FROM
                `schemas` AS s
                LEFT JOIN `schemas_competences` AS sc ON sc.schema_id=s.id
                LEFT JOIN `competences` AS c ON c.id=sc.competence_id
                LEFT JOIN `competences_tasks` AS ct ON ct.competence_id=c.id
                LEFT JOIN `schemas_trainings` AS st ON st.schema_id=s.id
                LEFT JOIN `trainings` AS t ON t.id=st.training_id
                LEFT JOIN `trainings_tasks` AS tt ON tt.training_id=t.id
        ";
        if (!$includeDeleted) $query .= "WHERE s.deleted_at IS NULL";
        $query .= "
            GROUP BY
                s.id, s.fullname, s.shortname,
                s.created_by, s.created_at, s.deleted_at, s.deleted_by,
                c.id, c.order_signature, c.name, c.description,
                t.id, t.order_signature, t.shortname, t.fullname, t.score_threshold
        ";
        print($query);
        die();
        foreach (DB::select($query) AS $row) {
            if (!isset($result[$row->s_id])) {
                $result[$row->s_id] = [
                    "id"            => (int) $row->s_id,
                    "fullname"      => $row->s_fullname,
                    "shortname"     => $row->s_shortname,
                    "created_by"    => $row->s_created_by,
                    "created_at"    => $row->s_created_at,
                    "deleted_by"    => $row->s_deleted_by,
                    "deleted_at"    => $row->s_deleted_at,
                    "competences"   => [],
                    "trainings"     => []
                ];
            }
            if (!isset($result[$row->s_id]['competences'][$row->c_id])) {
                $result[$row->s_id]['competences'][$row->c_id] = [
                    "id"                => (int) $row->c_id,
                    "order_signature"   => $row->c_order_signature,
                    "name"              => $row->c_name,
                    "description"       => $row->c_description,
                    "tasks_count"       => $row->ct_count
                ];
            }
            if (!isset($result[$row->s_id]['trainings'][$row->t_id])) {
                $result[$row->s_id]['trainings'][$row->t_id] = [
                    "id"                => (int) $row->t_id,
                    "order_signature"   => $row->t_order_signature,
                    "shortname"         => $row->t_shortname,
                    "fullname"          => $row->t_fullname,
                    "score_threshold"   => (float) $row->t_score_threshold,
                    "tasks_count"       => $row->tt_count
                ];
            }
        }
        return $result;
    }

}
