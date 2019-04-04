<!DOCTYPE html>
<html lang="pl">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <style>

            /* RESET I TEMPLATE STRON */
            html, body {
                font-family: 'dejavu sans';
                font-size: 11pt;
                text-align: left;
            }
            #report, #report * {
                font-family: inherit;
                font-size: inherit;
                text-align: inherit;
            }
            .break-after {
                page-break-after: always;
            }
            .break-before {
                page-break-before: always;
            }
            .nobreak-inside {
                page-break-inside: avoid;
            }
            .small-block {
                margin: 0.5cm 1cm;
            }
            table.table {
                border-collapse: collapse;
                color: #000000;
                font-size: inherit;
                width: 100%;
            }
            table.table-sm {
                font-size: 0.7em;
            }
            table.table td, table.table th {
                border: 1px solid #888;
                font-size: 1em;
                font-weight: normal;
                padding: 0.25em;
            }
            table.table thead th, table.table tfoot th, table.table thead td, table.table tfoot td {
                text-align: center;
                background-color: #888;
                color: #FFFFFF;
                padding: 0.35em;
            }
            table.table td.text-left, table.table th.text-left {
                text-align: left;
            }
            table.table tbody th {
                text-align: center;
            }
            .text-center {
                text-align: center;
            }
            .color-good {
                color: #009000;
            }
            .color-bad {
                color: #900000;
            }
            .width4perc {
                width: 4%;
            }
            .width10perc {
                width: 10%;
            }
            .width20perc {
                width: 20%;
            }


            /* STRONA PIERWSZA */

            .exam-date {
                text-align: right;
                font-style: italic;
            }
            .exam-header {
                text-align: center;
                margin: 2em 0;
                font-size: 1.4em;
                font-weight: bold;
                text-transform: uppercase;
                color: #002E68;
            }
            .exam-participant {

            }
            .exam-participant .name {
                font-weight: bold;
                text-transform: uppercase;
                color: #002E68;
            }
            .exam-participant .value {
                padding-left: 2em;
            }

            .exam-results {

            }
            .exam-results table {
                width: 100%;
            }

            /* STRONY NASTĘPNE */

            .competences-tasks-pivot table.table tfoot td.small-right {
                font-size: 0.7em;
                text-align: right;
                font-style: italic;
            }
            .pivot-header {
                margin-bottom: 0.3em;
            }


            .task-comments {
                margin: 0.2cm 2cm;
            }

            .comment-text p, .comment-text ul, .comment-text ol, .comment-text li {
                margin: 0.15em 0;
                font-size: 0.9em;
            }
            .comment-exam p, .comment-exam ul, .comment-exam ol, .comment-exam li {
                margin: 0.35em 0;
            }
            table.table td.overview {
                font-size: 1.4em;
            }

            @media only screen and (min-width: 900px) {
                body {
                    max-width: 900px;
                    margin: 0 auto;
                }
            }

        </style>
        @yield('styles')

        @yield('title')
    </head>
    <body>
        @yield('content')
    </body>
</html>
