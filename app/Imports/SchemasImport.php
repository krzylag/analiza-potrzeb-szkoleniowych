<?php

// namespace App\Imports;

// use App\Schema;
// use Maatwebsite\Excel\Concerns\ToCollection;
// use Maatwebsite\Excel\Concerns\WithHeadingRow;

// class SchemasImport implements ToCollection, WithHeadingRow {

//     public function collection(Collection $rows) {
//         $now = (new \DateTime())->format("Y-m-d H:i:s");
//         foreach ($rows AS $row) {
//             $this->importSchemaRow($row, $now);
//         }
//     }

//     private function importSchemaRow($row, $timeStr) {
//         $schema = new Schema([
//             'fullname'      => $row['nazwa_pelna'],
//             'shortname'     => $row['nazwa_skrocona'],
//             'created_by'    => \Auth::user()->id,
//             'created_at'    => $timeStr,
//             'modified_at'    => $timeStr,
//         ]);
//         $competencesIDs = explode(',', $row['identyfikatory_kompetencji_rozdzielone_przecinkami']);

//         return $schema;
//     }
// }
