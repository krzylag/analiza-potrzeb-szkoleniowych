<?php

namespace App\Imports;

use App\Competence;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class CompetencesImport implements ToCollection, WithHeadingRow {

    public function collection(Collection $rows) {
        foreach ($rows AS $row) {
            // dd($row);
            // Competence::create([
            //     'hash'              => $row['unikalny_identyfikator_kompetencji_tylko_male_litery_i_cyfry_bez_spacji'],
            //     'name'              => $row['nazwa'],
            //     'description'       => $row['opis'],
            //     'computed_summary'  => $row['identyfikatory_zadan_rozdzielone_przecinkamigrupowanie_dla_egzaminatorow']
            // ]);
        }
    }

}
