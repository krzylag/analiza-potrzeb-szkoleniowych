<?php

namespace App\Imports;

use App\Competence;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class CompetencesImport implements ToCollection, WithHeadingRow {

    public function collection(Collection $rows) {
        foreach ($rows AS $row) {
            Competence::create([
                'hash'              => $row['unikalny_identyfikator_kompetencji_tylko_male_litery_i_cyfry_bez_spacji'],
                'name'              => $row['nazwa'],
                'description'       => $row['opis'],
                'score_threshold'   => $row['poziom_zaliczenia_srednia_z_poziomow_zaliczenia_poszczegolnych_zadan'],
                'computed_summary'  => $row['identyfikatory_zadan_rozdzielone_przecinkami']
            ]);
        }
    }

}
