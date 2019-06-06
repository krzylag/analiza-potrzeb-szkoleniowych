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

// Route::middleware('auth:api')->get('/user', function (Request $request) {
//     return $request->user();
// });

Route::group(['prefix'=>'schema', 'middleware' => 'auth:api'], function() {

    Route::get ('/list',                    'ApiSchemaController@list');
    Route::get ('/list/{withDeleted?}',     'ApiSchemaController@list');

    Route::get ('/{schemaId}/get',          'ApiSchemaController@get');
    Route::post('/{schemaId}/delete',       'ApiSchemaController@delete');

});

Route::group(['prefix'=>'user', 'middleware' => 'auth:api'], function() {

    Route::get ('/list',                    'ApiUserController@list');
    Route::get ('/list/{withDeleted?}',     'ApiUserController@list');

});

//Route::group(['prefix'=>'exam'], function() {
Route::group(['prefix'=>'exam', 'middleware' => 'auth:api'], function() {

    Route::get ('/{examId}/get',                'ApiExamController@getShort');
    Route::get ('/{examId}/get/complete',       'ApiExamController@getComplete');
    Route::get ('/{examId}/get/structurized',   'ApiExamController@getCompleteExamStructurized');

    Route::post('/{examId}/training/{taskId}/override/{overrideId}',   'ApiExamController@setTrainingOverride');

    Route::get ('/list/for/{memberId}',         'ApiExamController@listUnfinishedExamsForMember');
    Route::get ('/scoring/{examIds}',           'ApiExamController@listExamsScoring');

    Route::get('/{examId}/{type}/pdf',          'ApiArchiveController@htmlToPdf');
    Route::get('/{examId}/{type}/html',         'ApiArchiveController@htmlToHtml');

});
