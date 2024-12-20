/*Dashboard Init*/

"use strict";

$('.selectpicker').on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
    if (clickedIndex === 0 ) {
        $(this).val([""]);
    }
	if (clickedIndex !== 0 && $(this).val() != null) {
		$(this).val($(this).val().filter(val => val !== ""));
	}
	if ($(this).val() == null) {
        $(this).val([""]);
    }
	$(this).selectpicker('refresh');
	getFilterData($(this).attr("name"));
});

function updateFilterElement(data, filterElement, filterField) {
	const filterOptions = [...new Set(data.map(d => d[filterField]))];
	$(filterElement).empty();
	$(filterElement).append('<option value="">All</option>');
	filterOptions.forEach(type => {
		if (type) {
			$(filterElement).append(`<option value="${type}">${type}</option>`);
		}
	});

	const selectedOptions = $(filterElement).data('selected') || [];
    const validSelectedOptions = selectedOptions.filter(val => filterOptions.includes(val));
    $(filterElement).val(validSelectedOptions.length > 0 ? validSelectedOptions : [""]).selectpicker('refresh');
}

function updateFilterValues(data, selectedFilter) {
	if(["type_of_import_filter"].includes(selectedFilter)) {		
		updateFilterElement(data, $('#batch-name-filter'), "batch_name");
		updateFilterElement(data, $('#object-type-filter'), "object_type(real_name)");
	}

	if(["batch_name_filter"].includes(selectedFilter)) {
		updateFilterElement(data, $('#object-type-filter'), "object_type(real_name)");
	}

	if (selectedFilter == "") {
		updateFilterElement(data, $('#type-of-import-filter'), "type_ofimport");
		updateFilterElement(data, $('#batch-name-filter'), "batch_name");
		updateFilterElement(data, $('#object-type-filter'), "object_type(real_name)");
	}
}

function getFilterData(selectedFilter) {
    const formData = new FormData();

	// Store the current selected values before sending the request
    $('#type-of-import-filter').data('selected', $('#type-of-import-filter').val());
    $('#batch-name-filter').data('selected', $('#batch-name-filter').val());
    $('#object-type-filter').data('selected', $('#object-type-filter').val());

	if(["type_of_import_filter", "batch_name_filter", "object_type"].includes(selectedFilter)) {
		const typeOfImport = $('#type-of-import-filter').val();
		formData.append('type_of_import', typeOfImport ? typeOfImport : []);
	}

	if(["batch_name_filter", "object_type_filter"].includes(selectedFilter)) {
		const batchName = $('#batch-name-filter').val();
		formData.append('batch_name', batchName ? batchName : []);
	}

	if(["object_type_filter"].includes(selectedFilter)) {
		const objectType = $('#object-type-filter').val();
		formData.append('object_type', objectType ? objectType : []);
	}

    $.ajax({
        type: 'POST',
        url: '/dashboard/get-data',
        data: formData,
        processData: false,
        contentType: false,
		beforeSend: function() {
            $('.preloader-it').show();
        },
        complete: function() {
            $('.preloader-it').hide();
        },
    	success:function(response) {
			const data = response.data;
			const totals = response.totals;
			updateFilterValues(data, selectedFilter);
			updateTotals(totals);
			updateCharts(totals);
			updateDataTable(data);

			// Re-apply selected values after data update
            $('#type-of-import-filter').data('selected', $('#type-of-import-filter').val());
            $('#batch-name-filter').data('selected', $('#batch-name-filter').val());
            $('#object-type-filter').data('selected', $('#object-type-filter').val());
		},
		error: function(error) {
			errorAlert("Data not found!");
        }
	});
}

getFilterData("");

function updateTotals(data) {
	$('#total-lines').html(data.total_lines);
	$('#total-success').html(data.total_success);
	$('#total-failures').html(data.total_failures);
	$('#total-time-days').html(data.total_time_taken.days);
	$('#total-time-hours').html(data.total_time_taken.hours);
	$('#total-time-minutes').html(data.total_time_taken.days);
	$('#total-time-seconds').html(data.total_time_taken.seconds);
}

let countChartInstance = null;
let statusChartInstance = null;

/*****E-Charts function start*****/
var echartsConfig = function(data) {
	const success = data.total_success;
	const failures = data.total_failures;
	const statusData = data.status_data;

	if( $('#status-chart').length > 0 ){
		var eChart_2 = echarts.init(document.getElementById('status-chart'));
		var option1 = {
			legend: {
				show:true,
			},
			tooltip : {
				backgroundColor: 'rgba(33,33,33,1)',
				borderRadius:0,
				padding:10,
				axisPointer: {
					type: 'cross',
					label: {
						backgroundColor: 'rgba(33,33,33,1)'
					}
				},
				textStyle: {
					color: '#fff',
					fontStyle: 'normal',
					fontWeight: 'normal',
					fontFamily: "'Open Sans', sans-serif",
					fontSize: 12
				}	
			},
			color: ['#8BC34A', '#0FC5BB', '#f33923'],			
			series : [
				{
					name: 'Batch',
					type: 'pie',
					radius : '55%',
					center: ['50%', '50%'],
					roseType : 'radius',
					tooltip : {
						trigger: 'item',
						formatter: "{a} <br/>{b} : {c} ({d}%)",
						backgroundColor: 'rgba(33,33,33,1)',
						borderRadius:0,
						padding:10,
						textStyle: {
							color: '#fff',
							fontStyle: 'normal',
							fontWeight: 'normal',
							fontFamily: "'Open Sans', sans-serif",
							fontSize: 12
						}	
					},
					data:statusData,
					itemStyle: {
						emphasis: {
							shadowBlur: 10,
							shadowOffsetX: 0,
							shadowColor: 'rgba(0, 0, 0, 0.5)'
						}
					}
				}
			]
		};
		eChart_2.setOption(option1);
		eChart_2.resize();
	}
	if( $('#count-chart').length > 0 ){
		var eChart_3 = echarts.init(document.getElementById('count-chart'));
		var option3 = {
			tooltip: {
				trigger: 'item',
				formatter: "{a} <br/>{b}: {c} ({d}%)"
			},
			legend: {
				show:true
			},
			series: [
				{
					name:'Count',
					type:'pie',
					selectedMode: 'single',
					radius: [0, '35%'],
					color: ['#8BC34A', '#f33923'],
					label: {
						normal: {
							show:false,
						}
					},
					data:[
						{value:success, name:'Success'},
						{value:failures, name:'Failures'},
					]
				},
				{
					name:'Count',
					type:'pie',
					radius: ['55%', '70%'],
					label: {
						normal: {
							show:false,
						}
					},
					color: ['#8BC34A', '#f33923'],
					data:[
						{value:success, name:'Success'},
						{value:failures, name:'Failures'},
					]
				}
			]
		};
		eChart_3.setOption(option3);
		eChart_3.resize();
	}
}
/*****E-Charts function end*****/

function updateCharts(data) {
	echartsConfig(data);
}

function updateDataTable(data) {
	$('#dashboard-report-table').DataTable({
		data: data,
		destroy: true,
		pageLength: 5,
		columns: [
			{ data: 'date', title: 'Date' },
			{ data: 'object_type(real_name)', title: 'Object Type' },
			{ data: 'object_type(display_name)', title: 'Display Name' },
			{ data: 'type_ofimport', title: 'Type of Import' },
			{ data: 'machine_hostname', title: 'Machine Hostname' },
			{ data: 'batch_name', title: 'Batch Name' },
			{ data: 'count_of_lines_in_batch_file', title: 'Count of Lines' },
			{ data: 'status', title: 'Status' },
			{ data: 'successful_count', title: 'Successful Count' },
			{ data: 'failure_count', title: 'Failure Count' },
			{ data: 'time_taken', title: 'Time Taken' }
		],
		dom: 'Bfrtip',
		buttons: [
			'copy', 'csv', 'excel', 'pdf', 'print'
		]
	});
}


function errorAlert(msg) {
	const Toast = Swal.mixin({
		toast: true,
		position: "top-end",
		showConfirmButton: false,
		timer: 3000,
		timerProgressBar: true,
		didOpen: (toast) => {
		  toast.onmouseenter = Swal.stopTimer;
		  toast.onmouseleave = Swal.resumeTimer;
		}
	  });
	  Toast.fire({
		icon: "error",
		title: msg,
		showClass: {
            popup: 'animated fadeIn faster'
        },
        hideClass: {
            popup: 'animated fadeOut faster'
        },
	  });
}