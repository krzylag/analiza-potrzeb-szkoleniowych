<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Examcomment extends Model
{
    //

    public function user() {
        return $this->belongsTo('App\User');
    }
}
