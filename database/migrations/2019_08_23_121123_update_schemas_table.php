<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateSchemasTable extends Migration {

    public $set_schema_table = 'schemas';

    public function up() {
        Schema::table($this->set_schema_table, function (Blueprint $table) {
            $table->string('config', 4096)->default('{}')->nullable()->after('computed_summary');
        });
    }

    public function down() {
        Schema::table($this->set_schema_table, function (Blueprint $table) {
            $table->dropColumn('config');
        });
    }
}
