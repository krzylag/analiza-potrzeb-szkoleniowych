<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateExamsCompetencesTable extends Migration
{
    /**
     * Schema table name to migrate
     * @var string
     */
    public $set_schema_table = 'exams_competences';

    /**
     * Run the migrations.
     * @table exam_competences
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable($this->set_schema_table)) return;
        Schema::create($this->set_schema_table, function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->bigIncrements('id');
            $table->unsignedBigInteger('exam_id');
            $table->unsignedBigInteger('competence_id');
            $table->string('allowed_users', 1024)->default('[]');
            $table->decimal('result', 12, 4)->nullable();
            $table->string('config', 4096)->nullable();

            $table->index(["exam_id"], 'IDX_EXAMID');

            $table->index(["competence_id"], 'IDX_COMPETENCEID');
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
