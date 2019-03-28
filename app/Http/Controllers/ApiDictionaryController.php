<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Schema;
use App\User;

class ApiDictionaryController extends Controller {

    function get() {
        return array(
            "schemas"   => Schema::with('competences')->get(),
            "examiners" => (User::all())->filter(function($user) { return $user->capabilities->can_examine; })
        );
    }

}
