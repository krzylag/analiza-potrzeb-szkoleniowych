<!DOCTYPE html>
<html lang="pl">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <style>
            html, body, * {
                font-family: 'dejavu sans';
            }
            .dateplace {
                text-align: right;
                font-style: italic;
            }
            .examheader {
                text-align: left;
                margin: 2em 0;
                font-size: 1.4em;
                font-weight: bold;
                text-transform: uppercase;
                color: #002E68;
            }
            .metryczka {

            }
            .metryczka td.name {
                font-weight: bold;
                text-transform: uppercase;
                color: #002E68;
                text-align: left;
                padding-left: 2em;
            }
            .metryczka td.value {
                text-align: left;
                padding-left: 2em;
            }
            .wyniki {
                border-collapse: collapse;
                width: 90%;
                margin: 1em auto;
                font-size: 0.9em;
            }
            .wyniki td {
                border: 1px solid #888;
            }
            thead td {
                font-size: 0.8em;
                text-align: center;
                color: #fff;
                background-color:#888
            }
            tbody td {
                text-align: center;
            }
            .color-good {
                color: #009000;
            }
            .color-bad {
                color: #900000;
            }
            .exam-comment {
                font-size: 0.9em;
            }
        </style>
        @yield('styles')
    </head>
    <body>
        @yield('content')
    </body>
</html>
