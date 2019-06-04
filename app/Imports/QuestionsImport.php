<?php

namespace App\Imports;

use App\Question;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class QuestionsImport implements ToCollection, WithHeadingRow {

    public function collection(Collection $rows) {
        foreach ($rows AS $row) {
            // Question::create([
            //     'hash'      => $row['unikalny_identyfikator_pytania_tylko_male_litery_i_cyfry_bez_spacji'],
            //     'text'      => $row['tresc_pytania'],
            //     'hint'      => $row['opis_pytania_dla_egzaminatora_mozesz_zostawic_pusty'],
            //     'score_min'      => $row['punktacja_od'],
            //     'score_max'      => $row['punktacja_do'],
            //     'score_step'      => $row['punktacja_co_ile_krok']
            // ]);
        }
    }

}
