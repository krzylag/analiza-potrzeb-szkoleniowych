<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Task extends Model {

    // The table associated with the model.
    protected $table = 'tasks';

    // The attributes that are mass assignable.
    protected $fillable =  [ 'hash', 'order_signature', 'grouping_hash', 'name', 'description', 'table_header', 'can_comment', 'time_available', 'score_threshold', 'computed_summary' ];

    // Ten model nie obsługuje automatycznych "created_at" i "updated_at"
    public $timestamps = false;

    // MUTATORS

    public function getComputedSummaryAttribute($value) {
        $result = new \stdClass();
        $existing = json_decode($value, $assoc=true);
        if (json_last_error() !== JSON_ERROR_NONE) return $value;
        if (!empty($existing)) {
            foreach (array_keys($existing) AS $key) {
                $result->{$key} = $existing[$key];
            }
        }
        return $result;
    }

    // RELATIONS

    public function questions() {
        return $this->belongsToMany('App\Question', 'tasks_questions', 'task_id', 'question_id');
    }

    public function competences() {
        return $this->belongsToMany('App\Competence', 'competences_tasks', 'task_id', 'competence_id');
    }

    public function taskcomments() {
        return $this->hasMany('App\Taskcomment');
    }

    public function exams() {
        return $this->belongsToMany('App\Exam', 'exams_tasks', 'task_id', 'exam_id')->withPivot(['is_accepted', 'user_id']);
    }

}
