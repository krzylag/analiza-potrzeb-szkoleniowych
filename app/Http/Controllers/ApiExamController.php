<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Exam;

class ApiExamController extends Controller {

    function createNew(Request $request) {
        $payload = $request->all();
        $creatorId = \Auth::user()->id;

        $exam = new Exam();
        $exam->schema_id = $payload['schemaId'];
        $exam->firstname = $payload['firstname'];
        $exam->surname = $payload['surname'];
        $exam->workplace = $payload['workplace'];
        $exam->date = $payload['date'];
        $exam->city = $payload['city'];
        $exam->created_by = $creatorId;

        $exam->save();

        $exam->users()->attach(array(
            $creatorId => array(
                'role' => 'chairman'
            )
        ));

        foreach(array_keys($payload['examiners']) AS $competKey) {
            $exam->competences()->attach(array(
                intVal($competKey) => array(
                    'allowed_users'=>'ascv')
                )
            );
            foreach($payload['examiners'][$competKey] AS $userId) {
                $exam->users()->attach(array(
                    $userId => array(
                        'role' => 'member'
                    )
                ));
            }
        }
    }

}
