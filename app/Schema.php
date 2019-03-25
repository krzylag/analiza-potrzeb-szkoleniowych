<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Schema extends Model {

    use SoftDeletes;


    // The table associated with the model.
    protected $table = 'schemas';

    // The attributes that are mass assignable.
    protected $fillable = [ 'fullname', 'shortname', 'created_by' ];


    public function competences() {
        return $this->belongsToMany('App\Competence', 'schemas_competences', 'schema_id', 'competence_id');
    }

    public function exams() {
        return $this->hasMany('App\Exam');
    }

}
