<?php

namespace App;

use Illuminate\Notifications\Notifiable;
//use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;

const CAPABILITIES_DEFAULT = array(
    'is_admin' => false,
    'can_lead' => false,
    'can_examine' => false,
    'can_search' => false,
    'can_manage_users' => false,
    'can_manage_schemas' => false
);

class User extends Authenticatable {

    use Notifiable;
    use SoftDeletes;

    // The table associated with the model.
    protected $table = 'users';

    // The attributes that are mass assignable.
    protected $fillable = [ 'firstname', 'surname', 'email', 'password', 'capabilities' ];

    // The attributes that should be hidden for arrays.
    protected $hidden = [ 'password', 'remember_token' ];

    // MUTATORS

    public function getCapabilitiesAttribute($value) {
        $result = new \stdClass();
        $existing = json_decode($value, $assoc=true);
        $isAdmin = (isset($existing['is_admin']) && $existing['is_admin']===true);
        foreach (array_keys(CAPABILITIES_DEFAULT) AS $cap) {
            $hasCurrentCapability = (isset($existing[$cap]) && $existing[$cap]===true);
            $result->{$cap} = ($isAdmin || $hasCurrentCapability);
        }
        return $result;
    }

    // RELATIONSHIPS

    public function taskcomments() {
        return $this->hasMany('App\Taskcomment');
    }

    public function scores() {
        return $this->hasMany('App\Score');
    }

    public function exams() {
        return $this->belongsToMany('App\Exam', 'users_exams', 'user_id', 'exam_id')->withPivot('role');
    }



}
