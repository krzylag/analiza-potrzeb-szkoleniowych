<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Exam;
use PDF;

class ApiArchiveController extends Controller
{

    public function listExams(Request $request) {
        $filters = $request->query('filters');
        if ($filters!=='' && $filters!==null) $filters = json_decode($filters);
        if ($filters->not_before !==null) $filters->not_before = new \DateTime($filters->not_before);
        if ($filters->not_after !==null) $filters->not_after = new \DateTime($filters->not_after);

        $exams = Exam::with('schema')->with('competences')->where('results', '<>', null)->get();

        return $exams;
    }


    public function getReportData($examId) {
        $exam = Exam::with('schema')->with('competences')->find($examId);
        $competences = array();
        $count = 1;
        foreach ($exam->competences AS $ckey=>$competence) {
            $result =  $exam->results[$competence->id];
            $competences[$competence->id] = array();
            $competences[$competence->id]['count'] = $count;
            $competences[$competence->id]['name'] = $competence->name;
            $competences[$competence->id]['required'] = floatval($competence->score_threshold);
            $competences[$competence->id]['scored'] = $result['avg'];
            $count++;
        }
        return array(
            "exam_city" => $exam->city,
            "exam_date" => (new \DateTime($exam->created_at))->format("Y-m-d"),
            "exam_comment" => $exam->comment,
            "exam_header_text" => $exam->schema->fullname,
            "examinee_name" => $exam->surname." ".$exam->firstname,
            "examinee_workplace" => $exam->workplace,
            "competences" => $competences
        );
    }

    public function htmlToPdf($type, $examId) {
        $exam = Exam::find($examId);
        $user = \Auth::user();
        if (!$user->capabilities->can_search) {
            return "Nie masz uprawnień dostępu do archiwum.";
        } else if (!empty($exam)) {
            $pdf = PDF::loadView('reports.default_short', $this->getReportData($examId));
            $date = (\DateTime::createFromFormat("Y-m-d H:i:s", $exam->created_at))->format('Y-m-d');
            $fname =  preg_replace("/[^a-zA-Z0-9ĄĆĘÓŚŹŻąćęóśźż_\.\-]/", "", $exam->surname."_".$exam->firstname."_".$date.".pdf");
            return $pdf->download($fname);
        } else {
            return "Nie ma takiego egzaminu";
        }

    }

    public function htmlToHtml($type, $examId) {
        $exam = Exam::find($examId);
        $user = \Auth::user();
        if (!$user->capabilities->can_search) {
            return "Nie masz uprawnień dostępu do archiwum.";
        } else if (!empty($exam)) {
            // $pdf = PDF::loadView('reports.default_short', $this->getReportData($examId));
            // $date = (\DateTime::createFromFormat("Y-m-d H:i:s", $exam->created_at))->format('Y-m-d');
            // $fname =  preg_replace("/[^a-zA-Z0-9ĄĆĘÓŚŹŻąćęóśźż_\.\-]/", "", $exam->surname."_".$exam->firstname."_".$date.".pdf");
            // return $pdf->download($fname);
        } else {
            return "Nie ma takiego egzaminu";
        }

    }
}
