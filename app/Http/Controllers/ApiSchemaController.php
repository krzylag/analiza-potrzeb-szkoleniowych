<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Imports\XlsxImport;
use Maatwebsite\Excel\Facades\Excel;
use App\Http\Controllers\Controller;
use App\Question;
use App\Task;
use App\Competence;
use App\Schema;

class ApiSchemaController extends Controller {

    function list() {
        return Schema::all();
    }

    function import(Request $request) {
        $file = $request->file('uploaded');

        // IMPORT QUESTIONS
        $pytaniaExistingId = (Question::max('id')===null) ? 0 : Question::max('id');
        $pytaniaImport = new XlsxImport();
        $pytaniaImport->onlySheets('PYTANIA');
        Excel::import($pytaniaImport, $file->path());

        // IMPORT TASKS
        $zadaniaExistingId = (Task::max('id')===null) ? 0 : Task::max('id');
        $zadaniaImport = new XlsxImport();
        $zadaniaImport->onlySheets('ZADANIA');
        Excel::import($zadaniaImport, $file->path());

        // POWIĄZANIE TASKS-QUESTIONS, WYLICZENIE PÓL POCHODNYCH DLA TASKS
        foreach( Task::where('id', '>', $zadaniaExistingId)->get() AS $task) {
            $qHashes = explode(',', $task->computed_summary);
            foreach ($qHashes AS $qHash) {
                $qHash = trim($qHash);
                $questions = Question::where([
                    ['hash', '=', $qHash],
                    ['id', '>', $pytaniaExistingId]
                ])->get();
                foreach ($questions AS $question) {
                    $question->tasks()->attach($task);
                }
            }
            $max = $task->questions->sum('score_max');
            $min = $task->questions->sum('score_min');
            $task->computed_summary = json_encode(array(
                "points_max"        => $max,
                "points_min"        => $min,
                "points_threshold"  => (($max-$min)*$task->score_threshold)+$min
            ));
            $task->save();

        }

        // IMPORT COMPETENCES
        $kompetencjeExistingId = (Competence::max('id')===null) ? 0 : Competence::max('id');
        $kompetencjeImport = new XlsxImport();
        $kompetencjeImport->onlySheets('KOMPETENCJE');
        Excel::import($kompetencjeImport, $file->path());

        // POWIĄZANIE COMPETENCES-TASKS
        foreach( Competence::where('id', '>', $kompetencjeExistingId)->get() AS $competence) {
            $cHashes = explode(',', $competence->computed_summary);
            foreach ($cHashes AS $cHash) {
                $cHash = trim($cHash);
                $tasks = Task::where([
                    ['hash', '=', $cHash],
                    ['id', '>', $zadaniaExistingId]
                ])->get();
                foreach ($tasks AS $task) {
                    $task->competences()->attach($competence);
                }
            }
            $competence->computed_summary = '{ }';
            $competence->save();
        }

        // IMPORT SCHEMAS
        $apsExistingId = (Schema::max('id')===null) ? 0 : Schema::max('id');
        $apsImport = new XlsxImport();
        $apsImport->onlySheets('APSY');
        Excel::import($apsImport, $file->path());

        // POWIĄZANIE COMPETENCES-SCHEMAS
        foreach( Schema::where('id', '>', $apsExistingId)->get() AS $schema) {
            $sHashes = explode(',', $schema->computed_summary);
            foreach ($sHashes AS $sHash) {
                $sHash = trim($sHash);
                $competences = Competence::where([
                    ['hash', '=', $sHash],
                    ['id', '>', $kompetencjeExistingId]
                ])->get();
                foreach ($competences AS $competence) {
                    $schema->competences()->attach($competence);
                }
            }
            $schema->computed_summary = '{ }';
            $schema->created_by = \Auth::user()->id;
            $schema->save();
        }

        return array("result" => true);
    }


}
