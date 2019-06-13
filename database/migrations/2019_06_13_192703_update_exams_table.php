<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateExamsTable extends Migration {

    public $set_schema_table = 'exams';

    public function up() {
        Schema::table($this->set_schema_table, function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    public function down() {
        Schema::table($this->set_schema_table, function (Blueprint $table) {
            $table->dropColumn('deleted_at');
        });
    }
}
