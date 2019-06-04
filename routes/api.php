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

Route::group(['prefix'=>'schema'], function() {

    Route::get('/list',                 'ApiSchemaController@list');
    Route::get('/list/{withDeleted?}',  'ApiSchemaController@list');

    Route::get('/{schemaId}/get',       'ApiSchemaController@get');

});
