<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateExamsTable extends Migration
{
    /**
     * Schema table name to migrate
     * @var string
     */
    public $set_schema_table = 'exams';

    /**
     * Run the migrations.
     * @table exams
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable($this->set_schema_table)) return;
        Schema::create($this->set_schema_table, function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->bigIncrements('id');
            $table->unsignedBigInteger('schema_id');
            $table->string('firstname', 255);
            $table->string('surname', 255);
            $table->string('workplace', 255)->nullable();
            $table->date('date')->nullable();
            $table->string('city', 255)->nullable();
            $table->string('results', 4096)->nullable();
            $table->string('config', 4096)->default('{}')->nullable();
            $table->text('comment')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();

            $table->nullableTimestamps();

            $table->index(["schema_id"], 'IDX_SCHEMAID');
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
