@extends('reports.template')

@section('content')
<div>
    <p class="dateplace">{{$exam_city}}, {{$exam_date}}</p>
    <h3 class="examheader">{{ $exam_header_text }}</h3>
    <table class="metryczka">
        <tbody>
            <tr>
                <td class="name">imię i nazwisko:</td>
                <td class="value">{{$examinee_name}}</td>
            </tr>
            <tr>
                <td class="name">dealer:</td>
                <td class="value">{{$examinee_workplace}}</td>
            </tr>
        </tbody>
    </table>
    <table class="wyniki">
        <thead>
            <tr>
                <td>#</td>
                <td>kompetencja</td>
                <td>wymagane</td>
                <td>otrzymał</td>
                <td>wynik</td>
            </tr>
        </thead>
        <tbody>
@foreach ($competences AS $compet)
            <tr>
                <td>{{$compet['count']}}</td>
                <td>{{$compet['name']}}</td>
                <td>{{ceil($compet['required']*10000)/100}}%</td>
                <td>{{ceil($compet['scored']*10000)/100}}%</td>
                <td>
@if ($compet['required']<=$compet['scored'])
                    POZYTYWNY
@else
                    NEGATYWNY
@endif
                </td>
            </tr>
@endforeach
        </tbody>
    </table>
</div>
<div>
    {!! $exam_comment !!}
</div>
@endsection
