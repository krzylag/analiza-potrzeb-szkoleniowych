<?php

namespace App\Imports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithConditionalSheets;
// use App\Imports\SchemasImport;
// use App\Imports\CompetencesImport;
use App\Imports\TasksImport;
use App\Imports\QuestionsImport;

class XlsxImport implements WithMultipleSheets {

    use WithConditionalSheets;

    public function conditionalSheets(): array {
        return [
            // 'APSY'          => new SchemasImport(),
            // 'KOMPETENCJE'   => new CompetencesImport(),
            'ZADANIA'       => new TasksImport(),
            'PYTANIA'       => new QuestionsImport()
        ];
    }

}
