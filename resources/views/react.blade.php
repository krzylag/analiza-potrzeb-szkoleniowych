@extends('layouts.app')

@section('apitoken')
    <!-- API Token -->
    <meta name="api-token" content="{{ $api_token }}">
@endsection

@section('content')
    <div id="root"></div>
@endsection
