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

    Route::group(['prefix'=>'schema'], function() {

        Route::get('/list', 'ApiSchemaController@list');
        Route::post('/import', 'ApiSchemaController@import');

    });

    Route::group(['prefix'=>'dictionary'], function() {

        Route::get('/get', 'ApiDictionaryController@get');

    });

});

Route::fallback('ReactController@index');
