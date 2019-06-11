<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\User;

class ApiUserController extends Controller
{
     // Create a new controller instance.
     public function __construct() {
        $this->middleware('auth');
    }

    public function getCurrentUser() {
        return \Auth::user();
    }

    public function addUser(Request $request) {
        $payload = $request->all();
        $existing = User::where('email', '=', $payload['email']);
        if ($existing->count()>0 && $existing->first()->id==$payload['id']) {
            $user = $existing->first();
            // UPDATE

            $user->firstname = $payload['firstname'];
            $user->surname = $payload['surname'];
            $user->email = $payload['email'];
            $user->capabilities = json_encode($payload['capabilities']);
            if (!empty($payload['password'])) {
                $user->password = Hash::make($payload['password']);
            }
            $user->save();
            return array(
                "result" => true,
                "user" => $user
            );

        } else if ($existing->count()>0 && (!isset($payload['id']) || empty($payload['id'])) ) {

            // ERROR DUPLICATED

            return array(
                "result" => false,
                "reason" => "email conflict",
                "user" => $existing->first(),
                "request" => $payload,
            );

        } else if ($existing->count()==0) {

            // INSERT

            $user = new User();
            $user->firstname = $payload['firstname'];
            $user->surname = $payload['surname'];
            $user->email = $payload['email'];
            $user->password = Hash::make($payload['password']);
            $user->capabilities = json_encode($payload['capabilities']);
            $user->save();

            return array(
                "result" => true,
                "user" => $user
            );
        }


    }

    public function deleteUser(Request $request) {
        $payload = $request->all();
        $user = User::find($payload['id']);
        if ($user===null) {
            return array(
                "result" => false,
                "reason" => "not-found"
            );
        } else {
            $user->delete();
            return array(
                "result" => true
            );
        }
    }

    public function list($withDeleted=false) {
        if ($withDeleted=='with-deleted') {
            $users = User::withTrashed()->all();
        } else {
            $users = User::all();
        }
        $result = [];
        foreach ($users AS $user) {
            $result[$user->id]=$user;
        }
        return $result;
    }

}
