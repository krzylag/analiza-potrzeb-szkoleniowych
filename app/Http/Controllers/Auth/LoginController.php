<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Support\Str;
use Illuminate\Foundation\Auth\AuthenticatesUsers;

class LoginController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles authenticating users for the application and
    | redirecting them to your home screen. The controller uses a trait
    | to conveniently provide its functionality to your applications.
    |
    */

    use AuthenticatesUsers;

    // Where to redirect users after login.
    protected $redirectTo = '/';

    // Create a new controller instance.
    public function __construct() {
        $this->middleware('guest')->except('logout');
    }

    // Do every time the user has been authenticated.
    protected function authenticated($request, $user) {
        $user->api_token = Str::random(60);
        $user->save();
    }
}
