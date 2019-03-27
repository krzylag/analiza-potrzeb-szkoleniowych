<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Question extends Model {

    // The table associated with the model.
    protected $table = 'questions';

    // The attributes that are mass assignable.
    protected $fillable = [ 'hash', 'text', 'hint', 'score_min', 'score_max', 'score_step' ];

    // Ten model nie obsługuje automatycznych "created_at" i "updated_at"
    public $timestamps = false;

    public function scores() {
        return $this->hasMany('App\Score');
    }

    public function tasks() {
        return $this->belongsToMany('App\Task', 'tasks_questions', 'question_id', 'task_id');
    }

}
