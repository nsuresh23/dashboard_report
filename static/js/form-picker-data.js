/*FormPicker Init*/

$(document).ready(function() {
    "use strict";

    $('.input-daterange-datepicker').daterangepicker({
            buttonClasses: ['btn', 'btn-sm'],
            applyClass: 'btn-info',
            cancelClass: 'btn-default',
            // autoApply: true,
            showWeekNumbers: true,
            // showISOWeekNumbers: true,
            // singleDatePicker: true,
            // showCustomRangeLabel: false,
            // startDate: moment().startOf('week'),
            // endDate: moment().endOf('week'),
            // format: 'Y-m-d H:i:s',
            locale: {
                format: 'YYYY-MM-DD',
                separator: ' to ',
            },
            ranges: {
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        }

    );

});
