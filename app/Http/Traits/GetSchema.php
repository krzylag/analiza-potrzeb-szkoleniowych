<?php

namespace App\Http\Traits;
use App\Schema;
use Illuminate\Support\Facades\DB;
use App\Task;

trait GetSchema {

    public function getSchemaStructureArray($schemaId) {
        $input = $this->getSchemasListArray($schemaId, true);

        if (sizeof($input)==0) return null;
        $input=array_shift($input);

        $tasks = [];
        foreach ($input['competences'] AS $competence) {
            foreach ($competence['tasks'] AS $t) {
                if (!isset($tasks[$t])) $tasks[$t]=$t;
            }
        }
        foreach ($input['trainings'] AS $training) {
            foreach ($training['tasks'] AS $t) {
                if (!isset($tasks[$t])) $tasks[$t]=$t;
            }
        }

        $tasks=Task::with('questions')->whereIn('id', $tasks)->get();

        foreach ($tasks AS $task) {
            $input['tasks'][$task->id]=[
                "id"                => $task->id,
                "order_signature"   => $task->order_signature,
                "grouping_hash"     => $task->grouping_hash,
                "name"              => $task->name,
                "description"       => $task->description,
                "table_header"      => $task->table_header,
                "can_comment"       => $task->can_comment,
                "time_available"    => $task->time_available,
                "score_threshold"   => (float) $task->score_threshold,
                "questions"         => []
            ];
            foreach ($task['questions'] AS $question) {
                $input['tasks'][$task->id]['questions'][$question->id]=$question->id;
                $input['questions'][$question->id]=[
                    "id"                => $question->id,
                    "order_signature"   => (float) $question->order_signature,
                    "text"              => $question->text,
                    "hint"              => $question->hint,
                    "score_min"         => (float) $question->score_min,
                    "score_max"         => (float) $question->score_max,
                    "score_step"        => (float) $question->score_step
                ];
            }
        }
        return $input;
    }


    public function getSchemasListArray($limitToIds=null, $includeDeleted=true) {
        $result = [];
        if (\is_array($limitToIds)) {
            if ($includeDeleted===true) {
                $input = Schema::withTrashed()->with('competences')->with('trainings')->whereIn("id", $limitToIds)->get();
            } else {
                $input = Schema::with('competences')->with('trainings')->whereIn("id", $limitToIds)->get();
            }
        } else if (\is_numeric($limitToIds)) {
            if ($includeDeleted===true) {
                $input = Schema::withTrashed()->with('competences')->with('trainings')->where("id", $limitToIds)->get();
            } else {
                $input = Schema::with('competences')->with('trainings')->where("id", $limitToIds)->get();
            }
        } else {
            if ($includeDeleted===true) {
                $input = Schema::withTrashed()->with('competences')->with('trainings')->get();
            } else {
                $input = Schema::with('competences')->with('trainings')->get();
            }
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
                    "task_count"        => $competence['tasks']->count(),
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
                    "task_count"        => $training['tasks']->count(),
                    "tasks"             => []
                ];
                foreach($training['tasks'] AS $task) {
                    $result[$schema->id]['trainings'][$training->id]['tasks'][$task->id]=$task->id;
                }
            }
        }
        return $result;
    }

}
