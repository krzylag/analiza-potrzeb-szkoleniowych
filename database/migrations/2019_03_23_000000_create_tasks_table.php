<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTasksTable extends Migration
{
    /**
     * Schema table name to migrate
     * @var string
     */
    public $tableName = 'tasks';

    /**
     * Run the migrations.
     * @table tasks
     *
     * @return void
     */
    public function up()
    {
        Schema::create($this->tableName, function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->bigIncrements('id');
            $table->string('hash', 45);
            $table->string('order_signature', 45);
            $table->string('grouping_hash', 45)->nullable();
            $table->string('name');
            $table->string('description')->nullable();
            $table->string('table_header')->nullable();
            $table->tinyInteger('can_comment')->default('1');
            $table->integer('time_available')->nullable()->default('600');
            $table->decimal('score_threshold', 12, 4)->default('0.7');
            $table->string('computed_summary')->default('{ "points_max": null, "points_min": null, "points_threshold": null }');

            $table->unique(["hash"], 'hash_UNIQUE');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
     public function down()
     {
       Schema::dropIfExists($this->tableName);
     }
}
