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

Route::get('logout',                                        '\App\Http\Controllers\Auth\LoginController@logout');

Route::group(['prefix'=>'archive', 'middleware' => 'auth'], function() {

    Route::get('/exam/{examId}/{type}/pdf',                 'ApiArchiveController@htmlToPdf');
    Route::get('/exam/{examId}/{type}/html',                'ApiArchiveController@htmlToHtml');

});

Route::fallback('ReactController@index');

