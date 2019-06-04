<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeCompetencesTable extends Migration {

    public $set_schema_table = 'competences';

    public function up() {
        Schema::table($this->set_schema_table, function (Blueprint $table) {
            $table->dropColumn('score_threshold');
            $table->string('order_signature', 45);
        });
    }

    public function down() {
        Schema::table($this->set_schema_table, function (Blueprint $table) {
            $table->decimal('score_threshold', 12, 4)->default('0.7');
            $table->dropColumn('order_signature');
        });
    }

}
