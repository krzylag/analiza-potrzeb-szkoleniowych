<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeQuestionsTable extends Migration {

    public $set_schema_table = 'questions';

    public function up() {
        Schema::table($this->set_schema_table, function (Blueprint $table) {
            $table->string('order_signature', 45);
        });
    }

    public function down() {
        Schema::table($this->set_schema_table, function (Blueprint $table) {
            $table->dropColumn('order_signature');
        });
    }

}
