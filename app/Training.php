<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Training extends Model {

    // The table associated with the model.
    protected $table = 'trainings';

    // The attributes that are mass assignable.
    protected $fillable = [ 'hash', 'order_signature', 'shortname', 'fullname', 'description', 'computed_summary' ];

    // Ten model nie obsługuje automatycznych "created_at" i "updated_at"
    public $timestamps = false;

    // Always load this relations with model
    protected $with = ['tasks'];

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

    public function tasks() {
        return $this->belongsToMany('App\Task', 'trainings_tasks', 'training_id', 'task_id');
    }

    public function schemas() {
        return $this->belongsToMany('App\Schema', 'schemas_competences', 'competence_id', 'schema_id');
    }


}
