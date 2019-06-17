<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::group(['prefix'=>'schema', 'middleware' => 'auth:api'], function() {

    Route::get ('/list',                    'ApiSchemaController@list');
    Route::get ('/list/{withDeleted?}',     'ApiSchemaController@list');

    Route::get ('/{schemaId}/get',          'ApiSchemaController@get');
    Route::post('/{schemaId}/delete',       'ApiSchemaController@delete');
    Route::post('/upload',                  'ApiSchemaController@upload');

});

Route::group(['prefix'=>'user', 'middleware' => 'auth:api'], function() {

    Route::get ('/list',                    'ApiUserController@list');
    Route::get ('/list/{withDeleted?}',     'ApiUserController@list');

    Route::get ('/get',                     'ApiUserController@getCurrentUser');
    Route::post('/add',                     'ApiUserController@addUser');
    Route::post('/{userId}/delete',         'ApiUserController@deleteUser');

});

//Route::group(['prefix'=>'exam'], function() {
Route::group(['prefix'=>'exam', 'middleware' => 'auth:api'], function() {

    Route::post('/new',                             'ApiExamController@createNew');

    Route::get ('/{examId}/get',                    'ApiExamController@getShort');
    Route::get ('/{examId}/get/complete',           'ApiExamController@getComplete');
    Route::get ('/{examId}/get/structurized',       'ApiExamController@getCompleteExamStructurized');
    Route::get ('/{examId}/set-flag',               'ApiExamController@setCompetenceFlag');
    Route::post('/{examId}/finalize',               'ApiExamController@finalizeExam');
    Route::post('/{examId}/revert',                 'ApiExamController@revertFinalizedExam');
    Route::post('/{examId}/delete',                 'ApiExamController@deleteExam');

    Route::post('/{examId}/set-comment',            'ApiExamController@setExamComment');
    Route::get ('/{examId}/get-default-comment',    'ApiExamController@getDefaultExamComment');

    Route::post('/{examId}/competence/{competenceId}/task/{taskId}/toggle-accepted',    'ApiExamController@toggleAcceptedTask');

    Route::get ('/{examId}/competence/{competenceId}/task/{taskId}/get/schema',         'ApiExamController@listTasksDictionary');
    Route::get ('/{examId}/competence/{competenceId}/task/{taskId}/get/statistics',     'ApiExamController@listTasksScores');
    Route::get ('/{examId}/competence/{competenceId}/task/{taskId}/get/comment',        'ApiExamController@getTaskComment');
    Route::post('/{examId}/competence/{competenceId}/task/{taskId}/set/comment',        'ApiExamController@setTaskComment');

    Route::post('/{examId}/training/{taskId}/override/{overrideId}',                    'ApiExamController@setTrainingOverride');
    Route::post('/{examId}/competence/{competenceId}/users/{users}',                    'ApiExamController@setCompetenceUsersAssignment');

    Route::post('/{examId}/competence/{competenceId}/task/{taskId}/question/{questionId}/set-score',          'ApiExamController@setQuestionScore');

    Route::get ('/list/',                           'ApiExamController@listUnfinishedExams');
    Route::get ('/list/for/{memberId}',             'ApiExamController@listUnfinishedExamsForMember');
    Route::get ('/scoring/{examIds}',               'ApiExamController@listExamsScoring');

    Route::get('/{examId}/{type}/pdf',              'ApiArchiveController@htmlToPdf');
    Route::get('/{examId}/{type}/html',             'ApiArchiveController@htmlToHtml');

});

Route::group(['prefix'=>'archive', 'middleware' => 'auth:api'], function() {

    Route::get('/list',                             'ApiArchiveController@listFinishedExams');

});
