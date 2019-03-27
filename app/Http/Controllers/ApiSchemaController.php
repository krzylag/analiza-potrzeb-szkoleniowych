<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Imports\XlsxImport;
use Maatwebsite\Excel\Facades\Excel;
use App\Http\Controllers\Controller;
use App\Question;
use App\Task;

class ApiSchemaController extends Controller
{



    function import(Request $request) {
        $file = $request->file('uploaded');

        $pytaniaImport = new XlsxImport();
        $pytaniaImport->onlySheets('PYTANIA');
        Excel::import($pytaniaImport, $file->path());

        $zadaniaImport = new XlsxImport();
        $zadaniaImport->onlySheets('ZADANIA');
        Excel::import($zadaniaImport, $file->path());

        foreach( Task::all() AS $task) {
            $qHashes = explode(',', $task->computed_summary);
            foreach ($qHashes AS $qHash) {
                $qHash = trim($qHash);
                $questions = Question::where('hash', '=', $qHash)->doesnthave('tasks')->get();
                foreach ($questions AS $question) {
                    $question->tasks()->attach($task);
                }
                $max = $questions->sum('score_max');
                $min = $questions->sum('score_min');
                $task->computed_summary = json_encode(array(
                    "points_max"        => $max,
                    "points_min"        => $min,
                    "points_threshold"  => (($max-$min)*$task->score_threshold)+$min
                ));
                $task->save();

                //  DB::table('questions')
                //     ->join('tasks_questions', 'tasks_questions.question_id', '=', 'questions.id')
                //     ->where('tasks_questions.id', '=', null)
                //     ->get();
            }
        }

        // return redirect('/')->with('success', 'All good!');
    }

}
