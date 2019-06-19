<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateExamsCompetencesTable extends Migration {

    public $set_schema_table = 'exams_competences';

    public function up() {
        Schema::table($this->set_schema_table, function (Blueprint $table) {
            $table->text('comment')->nullable();
        });
    }

    public function down() {
        Schema::table($this->set_schema_table, function (Blueprint $table) {
            $table->dropColumn('comment');
        });
    }
}
