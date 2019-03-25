<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Taskcomment extends Model {

    // The table associated with the model.
    protected $table = 'taskcomments';

    // The attributes that are mass assignable.
    protected $fillable = [ 'exam_id', 'task_id', 'user_id', 'comment' ];

    public function user() {
        return $this->belongsTo('App\User');
    }

    public function task() {
        return $this->belongsTo('App\Task');
    }

    public function exam() {
        return $this->belongsTo('App\Exam');
    }
}
