<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use PhpOffice\PhpSpreadsheet\Writer\Exception;

class Exam extends Model {

    // The table associated with the model.
    protected $table = 'exams';

    // The attributes that are mass assignable.
    protected $fillable = [ 'schema_id', 'firstname', 'surname', 'workplace', 'date', 'city', 'results', 'comment' ];

    public function users() {
        return $this->belongsToMany('App\User', 'users_exams', 'exam_id', 'user_id')->withPivot('role');
    }

    // MUTATORS

    public function getResultsAttribute($value) {
        $result = new \stdClass();
        try {
            $result = json_decode($value, $assoc=true);
        } catch (\Exception $e) {

        }
        return $result;
    }

    // RELATIONSHIPS

    public function competences() {
        return $this->belongsToMany('App\Competence', 'exams_competences', 'exam_id', 'competence_id')->withPivot(['result', 'allowed_users']);
    }

    public function schema() {
        return $this->belongsTo('App\Schema');
    }

    public function taskcomments() {
        return $this->hasMany('App\Taskcomment');
    }

    public function scores() {
        return $this->hasMany('App\Score');
    }

    public function tasks() {
        return $this->belongsToMany('App\Task', 'exams_tasks', 'exam_id', 'task_id')->withPivot(['is_accepted', 'user_id']);
    }

}
