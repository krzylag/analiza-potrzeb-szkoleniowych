<?php

namespace App\Http\Traits;

use App\Task;
use Illuminate\Support\Facades\DB;
use App\Score;

trait GetTask {

    public function getTaskStructure($examId, $taskId) {
        $task = Task::with('questions')->find($taskId);
        $result = [
            "id"                => $task->id,
            "name"              => $task->name,
            "description"       => $task->description,
            "table_header"      => $task->table_header,
            "order_signature"   => $task->order_signature,
            "grouping_hash"     => $task->grouping_hash,
            "points_threshold"  => null,
            "points_max"        => 0,
            "score_threshold"   => (float) $task->score_threshold,
            "can_comment"       => ($task->can_comment==true),
            "time_available"    => $task->time_available,
            "questions_count"   => 0,
            "questions"         => []
        ];
        foreach ($task->questions AS $question) {
            $result["questions"][$question->id]=[
                "id"                => $question->id,
                "text"              => $question->text,
                "hint"              => $question->hint,
                "order_signature"   => $question->order_signature,
                "score_min"         => (float) $question->score_min,
                "score_max"         => (float) $question->score_max,
                "score_step"        => (float) $question->score_step,
            ];
            $result['points_max'] += (float) $question->score_max;
            $result['questions_count']++;
        }
        $result['points_threshold']= $result['points_max']*$result['score_threshold'];
        return $result;
    }

    public function getTaskStatistics($examId, $taskId) {
        $task = $this->getTaskStructure($examId, $taskId);
        $questionsIds = [];
        foreach ($task['questions'] AS $q) {
            $questionsIds[]=$q['id'];
        }
        $answers = Score::where('exam_id', $examId)->whereIn('question_id', $questionsIds)->get();
        $result = [];
        foreach ($answers AS $ans) {
            if (!isset($result[$ans->question_id])) {
                $task['questions'][$ans->question_id]=[
                    "id"    => $ans->question_id,
                    "users" => []
                ];
            }
            if (!isset($result[$ans->question_id]['users'][$ans->user_id])) {
                $result[$ans->question_id]['users'][$ans->user_id]=[
                    "id"            => $ans->id,
                    "user_id"       => $ans->user_id,
                    "score"         => (float) $ans->score,
                    "updated_at"    => $ans->updated_at,
                ];
            }
        }
        return $result;
    }

}
