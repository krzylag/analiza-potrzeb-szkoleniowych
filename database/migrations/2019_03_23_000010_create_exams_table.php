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
    public $tableName = 'exams';

    /**
     * Run the migrations.
     * @table exams
     *
     * @return void
     */
    public function up()
    {
        Schema::create($this->tableName, function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->bigIncrements('id');
            $table->unsignedBigInteger('schema_id');
            $table->string('firstname');
            $table->string('surname');
            $table->string('dealer')->nullable();
            $table->string('city');
            $table->string('result_json')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->dateTime('created_at')->nullable();
            $table->dateTime('modified_at')->nullable();

            $table->index(["created_by"], 'IDX_CREATEDBY');

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
       Schema::dropIfExists($this->tableName);
     }
}
