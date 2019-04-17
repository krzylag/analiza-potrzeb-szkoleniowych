<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Auth::routes([
    'register' => false
]);
Route::get('logout', '\App\Http\Controllers\Auth\LoginController@logout');

Route::group(['prefix'=>'api2', 'middleware' => 'auth'], function() {

    Route::get('/user', 'ApiUserController@getCurrentUser');
    Route::post('/user/add', 'ApiUserController@addUser');
    Route::post('/user/delete', 'ApiUserController@deleteUser');

    Route::group(['prefix'=>'schema'], function() {

        Route::get('/list', 'ApiSchemaController@list');
        Route::post('/import', 'ApiSchemaController@import');

    });

    Route::group(['prefix'=>'dictionary'], function() {

        Route::get('/get', 'ApiDictionaryController@get');

    });

    Route::group(['prefix'=>'exam'], function() {

        Route::get('/list-unfinished-for-member/{id}', 'ApiExamController@listUnfinishedForMember');
        Route::post('/new', 'ApiExamController@createNew');

        Route::post('/finalize', 'ApiExamController@finalizeExam');
        Route::post('/revert', 'ApiExamController@revertFinalizedExam');

        Route::get('/get/{examId}', 'ApiExamController@getExam');
        Route::post('/set-comment', 'ApiExamController@setExamComment');
        Route::get('/get-default-comment/{examId}', 'ApiExamController@getDefaultExamComment');

        Route::group(['prefix'=>'accepted-task'], function() {
            Route::get('/list/{examId}/{competenceId}', 'ApiExamController@listAcceptedTasks');
            Route::post('/toggle', 'ApiExamController@toggleAcceptedTask');
        });

        Route::group(['prefix'=>'grading'], function() {
            Route::get('/get-competence-scores/{examId}/{competenceId}', 'ApiExamController@listCompetenceScores');

            Route::get('/get-tasks/{examId}/{competenceId}/{taskId}', 'ApiExamController@listTasksDictionary');
            Route::get('/get-scores/{examId}/{competenceId}/{taskId}', 'ApiExamController@listQuestionScores');
            Route::post('/set-score', 'ApiExamController@setQuestionScore');
            Route::get('/get-comment/{examId}/{competenceId}/{taskId}', 'ApiExamController@getTaskComment');
            Route::post('/set-comment', 'ApiExamController@setTaskComment');
        });

    });

    Route::group(['prefix'=>'archive'], function() {
        Route::get('/list', 'ApiArchiveController@listExams');
        // Route::get('/report/short/{examId}', 'ApiArchiveController@createShortReportHtml');
        // Route::get('/report/full/{examId}', 'ApiArchiveController@createFullReportHtml');
        Route::get('/pdf/{type}/{examId}', 'ApiArchiveController@htmlToPdf');
        Route::get('/preview/{type}/{examId}', 'ApiArchiveController@htmlToHtml');
    });

});

Route::fallback('ReactController@index');
