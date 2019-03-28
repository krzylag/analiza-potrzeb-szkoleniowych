<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ApiUserController extends Controller
{
     // Create a new controller instance.
     public function __construct() {
        $this->middleware('auth');
    }

    public function getCurrentUser() {
        return \Auth::user();
    }
}
