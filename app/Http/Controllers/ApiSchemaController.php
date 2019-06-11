<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Imports\XlsxImport;
use Maatwebsite\Excel\Facades\Excel;
use App\Http\Controllers\Controller;
use App\Http\Traits\GetSchema;
use App\Question;
use App\Task;
use App\Competence;
use App\Schema;
use App\Training;

class ApiSchemaController extends Controller {

    use GetSchema;

    function list($withDeleted=false) {
        return $this->getSchemasListArray(null, ($withDeleted=='with-deleted'));
    }

    public function get($schemaId) {
        return $this->getSchemaStructureArray($schemaId);
    }

    public function delete(Request $request) {
        $payload = $request->all();
        $schema = Schema::find($payload['schema_id']);
        if ($schema!==null) {
            $schema->deleted_by = \Auth::user()->id;
            $schema->save();
            $schema->delete();
            return [ "result" => true ];
        } else {
            return [ "result" => false ];
        }
    }

    function upload(Request $request) {
        $file = $request->file('uploaded');


        $imported = [ 'APSY' => [], 'KOMPETENCJE' => [], 'RAPORTY' => [], 'ZADANIA' => [], 'PYTANIA' => [] ];
        $errors = [];
        $notices = [];

        // Importowanie zakładek z przesłanego pliku
        $apsImport = new XlsxImport();
        $apsImport->onlySheets(['APSY', 'KOMPETENCJE', 'RAPORTY', 'ZADANIA', 'PYTANIA']);
        foreach (Excel::toArray($apsImport, $file) AS $bookmark=>$rows) {
            switch($bookmark) {
                case 'APSY':
                    foreach ($rows AS $row) {
                        $item = [
                            'fullname'  =>  $row['nazwa_formalna'],
                            'shortname'  =>  $row['nazwa_skrocona'],
                            'competences' => [],
                            'trainings' => []
                        ];
                        foreach(explode(',',$row['identyfikatory_kompetencji_rozdzielone_przecinkami']) AS $hashC) {
                            $hashC=trim($hashC);
                            $item['competences'][$hashC]=$hashC;
                        }
                        foreach(explode(',',$row['identyfikatory_raportow_rozdzielone_przecinkami']) AS $hashR) {
                            $hashR=trim($hashR);
                            $item['trainings'][$hashR]=$hashR;
                        }
                        $imported[$bookmark][]=$item;
                    }
                    break;

                case 'KOMPETENCJE':
                    foreach ($rows AS $row) {
                        $hash = trim($row['id_unikalny']);
                        $item = [
                            'hash'  =>  $hash,
                            'order_signature'  =>  $row['numer_zadania_do_opisow_i_do_sortowania_dowolny_string_moze_sie_powtarzac'],
                            'name'  =>  $row['nazwa'],
                            'description' => $row['opis'],
                            'tasks' => [],
                            'usage_counter' => 0,
                        ];
                        foreach(explode(',',$row['identyfikatory_zadan_rozdzielone_przecinkamigrupowanie_dla_egzaminatorow']) AS $hashT) {
                            $hashT=trim($hashT);
                            $item['tasks'][$hashT]=$hashT;
                        }
                        $imported[$bookmark][$hash]=$item;
                    }
                    break;

                case 'RAPORTY':
                    foreach ($rows AS $row) {
                        $hash = trim($row['id_unikalny']);
                        $item = [
                            'hash'  =>  $hash,
                            'order_signature'  =>  $row['numer_zadania_do_opisow_i_do_sortowania_dowolny_string_moze_sie_powtarzac'],
                            'shortname'  =>  $row['nazwa_krotka_identyfikacyjna'],
                            'fullname' => $row['nazwa_pelna_formalna'],
                            'score_threshold' => (float) $row['poziom_zaliczenia_srednia_z_poziomow_zaliczenia_poszczegolnych_zadan'],
                            'tasks' => [],
                            'usage_counter' => 0,
                        ];
                        foreach(explode(',',$row['identyfikatory_zadan_rozdzielone_przecinkamigrupowanie_dla_raportow']) AS $hashT) {
                            $hashT=trim($hashT);
                            $item['tasks'][$hashT]=$hashT;
                        }
                        $imported[$bookmark][$hash]=$item;
                    }
                    break;

                case 'ZADANIA':
                    foreach ($rows AS $row) {
                        $hash = trim($row['id_unikalny']);
                        $item = [
                            'hash'  =>  $hash,
                            'order_signature'  =>  $row['numer_zadania_do_opisow_i_do_sortowania_dowolny_string_moze_sie_powtarzac'],
                            'grouping_hash' => $row['grupowanie_zadanunikalny_ciag_znakow_domyslnie_pusty_jesli_jest_taki_sam_w_kilku_zadaniach_zostana_zgrupowane'],
                            'name' => $row['nazwa_zadania'],
                            'description' => $row['opis_zadania_dla_egzaminatora_mozesz_zostawic_pusty'],
                            'table_header' => $row['tytul_tabeli_z_pytaniami'],
                            'can_comment' => (int) $row['czy_poprosic_o_komentarz_trenera_0_1'],
                            'time_available' => $row['czas_na_wykonanie_w_sekundach10min_600s'],
                            'score_threshold' => (float) $row['poziom_zaliczenia'],
                            'questions' => [],
                            'usage_trainings_counter' => 0,
                            'usage_competences_counter' => 0,
                        ];
                        foreach(explode(',',$row['identyfikatory_pytan_rozdzielone_przecinkami']) AS $hashQ) {
                            $hashQ=trim($hashQ);
                            $item['questions'][$hashQ]=$hashQ;
                        }
                        $imported[$bookmark][$hash]=$item;
                    }
                    break;

                case 'PYTANIA':
                    foreach ($rows AS $row) {
                        $hash = trim($row['id_unikalny']);
                        $item = [
                            'hash'  =>  $hash,
                            'order_signature'  =>  $row['numer_zadania_do_opisow_i_do_sortowania_dowolny_string_moze_sie_powtarzac'],
                            'text'  =>  $row['tresc_pytania'],
                            'hint' => $row['opis_pytania_dla_egzaminatora_mozesz_zostawic_pusty'],
                            'score_min' => (int) $row['punktacja_od'],
                            'score_max' => (int) $row['punktacja_do'],
                            'score_step' => (int) $row['punktacja_co_ile_krok'],
                            'usage_counter' => 0,
                        ];
                        $imported[$bookmark][$hash]=$item;
                    }
                    break;
            }
        };

        // Wypełnienie zmiennych "usage_counter"
        // Jednocześnie alarmowanie o błędach jeśli nie istnieje cel przypisania.
        foreach ($imported['ZADANIA'] AS $task) {
            foreach ($task['questions'] AS $qId=>$qVal) {
                if (isset($imported['PYTANIA'][$qId]['usage_counter'])) $imported['PYTANIA'][$qId]['usage_counter']++;
                else $errors[]='Zadanie ('.$task['hash'].') posiada nie istniejące pytanie ('.$qId.').';
            }
            if (sizeof($task['questions'])==0) $errors[]='Zadanie ('.$task['hash'].') nie posiada żadnych pytań.';
        }
        foreach ($imported['RAPORTY'] AS $training) {
            foreach ($training['tasks'] AS $tId=>$tVal) {
                if (isset($imported['ZADANIA'][$tId]['usage_trainings_counter'])) $imported['ZADANIA'][$tId]['usage_trainings_counter']++;
                else $errors[]='Szkolenie ('.$training['hash'].') posiada nie istniejące zadanie ('.$tId.').';
            }
            if (sizeof($training['tasks'])==0) $errors[]='Szkolenie ('.$training['hash'].') nie posiada żadnych zadań.';
        }
        foreach ($imported['KOMPETENCJE'] AS $competence) {
            foreach ($competence['tasks'] AS $tId=>$tVal) {
                if (isset($imported['ZADANIA'][$tId]['usage_competences_counter'])) $imported['ZADANIA'][$tId]['usage_competences_counter']++;
                else $errors[]='Kompetencja ('.$task['hash'].') posiada nie istniejące zadanie ('.$tId.').';
            }
            if (sizeof($competence['tasks'])==0) $errors[]='Kompetencja ('.$competence['hash'].') nie posiada żadnych zadań.';
        }
        foreach ($imported['APSY'] AS $schema) {
            foreach ($schema['competences'] AS $cId=>$cVal) {
                if (isset($imported['KOMPETENCJE'][$cId]['usage_counter'])) $imported['KOMPETENCJE'][$cId]['usage_counter']++;
                else $errors[]='Schemat ('.$schema['hash'].') posiada nie istniejącą kompetencję ('.$cId.').';
            }
            if (sizeof($schema['competences'])==0) $errors[]='Schemat ('.$schema['hash'].') nie posiada żadnych kompetencji.';
            foreach ($schema['trainings'] AS $tId=>$tVal) {
                if (isset($imported['RAPORTY'][$tId]['usage_counter'])) $imported['RAPORTY'][$tId]['usage_counter']++;
                else $errors[]='Schemat ('.$schema['hash'].') posiada nie istniejące szkolenie ('.$tId.').';
            }
            if (sizeof($schema['trainings'])==0) $errors[]='Schemat ('.$schema['hash'].') nie posiada żadnych szkoleń.';
        }

        // Sprawdzenie wartości "usage_counter"-s i wpisanie do błędów/ostrzeżeń
        foreach ($imported['PYTANIA'] AS $q) {
            if ($q['usage_counter']==0) {
                $errors[]='Pytanie ('.$q['hash'].') nie jest przypisane do żadnego zadania.';
            }
            if ($q['usage_counter'] > 1) {
                $notices[]='Pytanie ('.$q['hash'].') jest przypisane do wielu zadań: ('.$q['usage_counter'].').';
            }
        }
        foreach ($imported['ZADANIA'] AS $t) {
            if ($t['usage_trainings_counter']==0) {
                $errors[]='Zadanie ('.$t['hash'].') nie jest przypisane do żadnego raportu.';
            }
            if ($t['usage_trainings_counter'] > 1) {
                $notices[]='Zadanie ('.$t['hash'].') jest przypisane do wielu raportów: ('.$t['usage_counter'].').';
            }
            if ($t['usage_competences_counter']==0) {
                $errors[]='Zadanie ('.$t['hash'].') nie jest przypisane do żadnegj kompetencji.';
            }
            if ($t['usage_competences_counter'] > 1) {
                $notices[]='Zadanie ('.$t['hash'].') jest przypisane do wielu kompetencji: ('.$t['usage_counter'].').';
            }
        }
        foreach ($imported['KOMPETENCJE'] AS $c) {
            if ($c['usage_counter']==0) {
                $errors[]='Kompetencja ('.$c['hash'].') nie jest przypisana do żadnego schematu.';
            }
            if ($c['usage_counter'] > 1) {
                $notices[]='Kompetencja ('.$c['hash'].') jest przypisane do wielu schematów: ('.$c['usage_counter'].').';
            }
        }
        foreach ($imported['RAPORTY'] AS $r) {
            if ($r['usage_counter']==0) {
                $errors[]='Szkolenie ('.$r['hash'].') nie jest przypisana do żadnego schematu.';
            }
            if ($r['usage_counter'] > 1) {
                $notices[]='Szkolenie ('.$r['hash'].') jest przypisane do wielu schematów: ('.$r['usage_counter'].').';
            }
        }


        // Jeśli nie znaleziono żadnych błędów podczas importu, utwórz obiekty i zapisz do bazy danych
        if (sizeof($errors)==0) {
            foreach ($imported['PYTANIA'] AS $qId => $qVal) {
                $imported['PYTANIA'][$qId]=Question::create($qVal);
                $imported['PYTANIA'][$qId]->save();
            }
            foreach ($imported['ZADANIA'] AS $tId => $tVal) {
                $imported['ZADANIA'][$tId]=Task::create($tVal);
                $imported['ZADANIA'][$tId]->save();
                foreach ($tVal['questions'] AS $qId) {
                    $imported['ZADANIA'][$tId]->questions()->attach($imported['PYTANIA'][$qId]);
                }
            }
            foreach ($imported['RAPORTY'] AS $rId => $rVal) {
                $imported['RAPORTY'][$rId]=Training::create($rVal);
                $imported['RAPORTY'][$rId]->save();
                foreach ($rVal['tasks'] AS $tId) {
                    $imported['RAPORTY'][$rId]->tasks()->attach($imported['ZADANIA'][$tId]);
                }
            }
            foreach ($imported['KOMPETENCJE'] AS $cId => $cVal) {
                $imported['KOMPETENCJE'][$cId]=Competence::create($cVal);
                $imported['KOMPETENCJE'][$cId]->save();
                foreach ($cVal['tasks'] AS $tId) {
                    $imported['KOMPETENCJE'][$cId]->tasks()->attach($imported['ZADANIA'][$tId]);
                }
            }
            foreach ($imported['APSY'] AS $sId => $sVal) {
                $imported['APSY'][$sId]=Schema::create($sVal);
                $imported['APSY'][$sId]->created_by = \Auth::user()->id;
                $imported['APSY'][$sId]->save();
                foreach ($sVal['competences'] AS $cId) {
                    $imported['APSY'][$sId]->competences()->attach($imported['KOMPETENCJE'][$cId]);
                }
                foreach ($sVal['trainings'] AS $rId) {
                    $imported['APSY'][$sId]->trainings()->attach($imported['RAPORTY'][$rId]);
                }
            }
        }


        return [
            "result" => (sizeof($errors)==0),
            "errors" => $errors,
            "notices" => $notices,
        ];
    }


}
