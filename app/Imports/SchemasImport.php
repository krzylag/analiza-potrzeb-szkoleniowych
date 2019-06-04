<?php

namespace App\Imports;

use App\Schema;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class SchemasImport implements ToCollection, WithHeadingRow {

    public function collection(Collection $rows) {
        foreach ($rows AS $row) {
            // Schema::create([
            //     'fullname'          => $row['nazwa_formalna'],
            //     'shortname'         => $row['nazwa_skrocona']
            // ]);
        }
    }

}
