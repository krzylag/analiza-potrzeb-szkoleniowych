<?php

namespace App\Imports;

use App\Task;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class TasksImport implements ToCollection, WithHeadingRow {

    public function collection(Collection $rows) {
        foreach ($rows AS $row) {
            dd($row);
            // Task::create([
            //     'hash'              => $row['unikalny_identyfikator_zadania_tylko_male_litery_i_cyfry_bez_spacji'],
            //     'order_signature'   => $row['numer_zadania_do_opisow_i_do_sortowania_dowolny_string_moze_sie_powtarzac'],
            //     'grouping_hash'     => $row['grupowanie_zadanunikalny_ciag_znakow_domyslnie_pusty_jesli_jest_taki_sam_w_kilku_zadaniach_zostana_zgrupowane'],
            //     'name'              => $row['nazwa_zadania'],
            //     'description'       => $row['opis_zadania_dla_egzaminatora_mozesz_zostawic_pusty'],
            //     'table_header'      => $row['tytul_tabeli_z_pytaniami'],
            //     'can_comment'       => $row['czy_poprosic_o_komentarz_trenera_0_1'],
            //     'time_available'    => $row['czas_na_wykonanie_w_sekundach10min_600s'],
            //     'score_threshold'   => $row['poziom_zaliczenia'],
            //     'computed_summary'  => $row['identyfikatory_pytan_rozdzielone_przecinkami']
            // ]);
        }
    }

}
