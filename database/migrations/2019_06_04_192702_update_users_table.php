<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateUsersTable extends Migration {

    public $set_schema_table = 'users';

    public function up() {
        Schema::table($this->set_schema_table, function (Blueprint $table) {
            $table->string('api_token', 100)->nullable();
        });
    }

    public function down() {
        Schema::table($this->set_schema_table, function (Blueprint $table) {
            $table->dropColumn('api_token');
        });
    }
}
