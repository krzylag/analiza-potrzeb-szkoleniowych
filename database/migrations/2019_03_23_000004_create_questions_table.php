<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateQuestionsTable extends Migration
{
    /**
     * Schema table name to migrate
     * @var string
     */
    public $tableName = 'questions';

    /**
     * Run the migrations.
     * @table questions
     *
     * @return void
     */
    public function up()
    {
        Schema::create($this->tableName, function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->bigIncrements('id');
            $table->string('hash', 45);
            $table->string('text');
            $table->string('hint')->nullable();
            $table->decimal('score_min', 12, 4);
            $table->decimal('score_max', 12, 4);
            $table->decimal('score_step', 12, 4);

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
