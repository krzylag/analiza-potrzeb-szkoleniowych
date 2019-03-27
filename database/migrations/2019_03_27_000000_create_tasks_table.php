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
    public $set_schema_table = 'tasks';

    /**
     * Run the migrations.
     * @table tasks
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable($this->set_schema_table)) return;
        Schema::create($this->set_schema_table, function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->bigIncrements('id');
            $table->string('hash', 45);
            $table->string('order_signature', 45);
            $table->string('grouping_hash', 45)->nullable();
            $table->string('name', 1024);
            $table->string('description', 4096)->nullable();
            $table->string('table_header', 4096)->nullable();
            $table->tinyInteger('can_comment')->default('1');
            $table->integer('time_available')->nullable()->default('600');
            $table->decimal('score_threshold', 12, 4)->default('0.7');
            $table->string('computed_summary', 4096)->default('{ "points_max": null, "points_min": null, "points_threshold": null }');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
     public function down()
     {
       Schema::dropIfExists($this->set_schema_table);
     }
}
