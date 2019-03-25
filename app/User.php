<?php

namespace App;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable {

    use Notifiable;
    use SoftDeletes;

    // The table associated with the model.
    protected $table = 'users';

    // The attributes that are mass assignable.
    protected $fillable = [ 'firstname', 'surname', 'email', 'password', 'is_admin', 'capabilities_json' ];

    // The attributes that should be hidden for arrays.
    protected $hidden = [ 'password', 'remember_token' ];




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
