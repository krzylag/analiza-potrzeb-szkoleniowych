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

Route::group(['prefix'=>'exam'], function() {
//Route::group(['prefix'=>'exam', 'middleware' => 'auth:api'], function() {

    Route::get ('/list/for/{memberId}',         'ApiExamController@listUnfinishedExamsForMember');
    Route::get ('/scoring/{examIds}',           'ApiExamController@listExamsScoring');

});
