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
                text-align: center;
                margin: 2em 0;
                font-size: 1.2em;
                text-transform: uppercase;
            }
            td.name {
                font-style: italic;
                color: #888;
                text-align: right;
            }
            td.value {
                font-weight: 600;
                text-align: left;
            }
            .metryczka {
                width: 90%;
                margin: 2em auto;
            }
            .wyniki {
                border-collapse: collapse;
                width: 90%;
                margin: 1em auto;
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
        </style>
    </head>
    <body>
        @yield('content')
    </body>
</html>
