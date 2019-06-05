<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReactController extends Controller {

    // Create a new controller instance.
    public function __construct() {
        $this->middleware('auth');
    }

    // Show the application dashboard.

    public function index() {
        return view('react', [
            "api_token" => Auth::user()->api_token
        ]);
    }

}
