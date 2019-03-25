<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Score extends Model {

    // The table associated with the model.
    protected $table = 'scores';

    // The attributes that are mass assignable.
    protected $fillable = [ 'exam_id', 'question_id', 'user_id', 'score' ];

    public function user() {
        return $this->belongsTo('App\User');
    }

    public function question() {
        return $this->belongsTo('App\Question');
    }

    public function exam() {
        return $this->belongsTo('App\Exam');
    }


}
