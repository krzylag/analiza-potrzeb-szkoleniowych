<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Schema extends Model {

    use SoftDeletes;


    // The table associated with the model.
    protected $table = 'schemas';

    // The attributes that are mass assignable.
    protected $fillable = [ 'fullname', 'shortname', 'created_by', 'computed_summary' ];

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

    public function competences() {
        return $this->belongsToMany('App\Competence', 'schemas_competences', 'schema_id', 'competence_id');
    }

    public function trainings() {
        return $this->belongsToMany('App\Training', 'schemas_trainings', 'schema_id', 'training_id');
    }

    public function exams() {
        return $this->hasMany('App\Exam');
    }

}
