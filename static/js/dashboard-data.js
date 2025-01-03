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
	var selectedMenuItem = $('.side-menu.active').data('menu-item');
	if(selectedMenuItem == "Count"){
		if (selectedFilter == "") {
			updateFilterElement(data, $('#type-filter'), "type");
		}
	} else {
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
}

function getFilterData(selectedFilter) {
    const formData = new FormData();

	// Selected menu
	var selectedMenuItem = $('.side-menu.active').data('menu-item');
	formData.append('menu', selectedMenuItem ? selectedMenuItem : "");

	if(selectedMenuItem == "Count"){
		// Store the current selected values before sending the request
		$('#type-filter').data('selected', $('#type-filter').val());
		if(["type_filter"].includes(selectedFilter)) {
			const typeFilter = $('#type-filter').val();
			formData.append('type', typeFilter ? typeFilter : []);
		}
	} else {
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
			const error = response.error;

			if(data && !$.isEmptyObject(data)) {
				updateDataTable(data);
				updateFilterValues(data, selectedFilter);
			}

			if(totals && !$.isEmptyObject(totals)) {
				updateTotals(totals);
				updateCharts(totals);
			}

			if(error) {
				errorAlert(error);
			}

			if(selectedMenuItem == "Count"){
				$('#type-filter').data('selected', $('#type-filter').val());
			}else {
				// Re-apply selected values after data update
				$('#type-of-import-filter').data('selected', $('#type-of-import-filter').val());
				$('#batch-name-filter').data('selected', $('#batch-name-filter').val());
				$('#object-type-filter').data('selected', $('#object-type-filter').val());
			}
		},
		error: function(error) {
			errorAlert("Data not found!");
        }
	});
}


// getFilterData("");

$(document).ready(function() {
	$('.side-menu.active').trigger('click');
});

$(".side-menu").on("click", function(e){
	e.preventDefault(true);
	$('.side-menu').removeClass('active');
	$(this).addClass('active');

	// Selected menu
	var selectedMenuItem = $('.side-menu.active').data('menu-item');

	if(selectedMenuItem == "Count") {
		$(".non-overview").hide();
		// $(".progress-chart").removeClass("col-lg-4");
		// $(".progress-chart").addClass("col-lg-8");
		$(".overview").show();
	} else {
		$(".overview").hide();
		// $(".progress-chart").removeClass("col-lg-8");
		// $(".progress-chart").addClass("col-lg-4");
		$(".non-overview").show();
	}

	clearAll();
	getFilterData("");
});

function updateTotals(data) {
	let selectedMenuItem = $('.side-menu.active').data('menu-item');
	if (selectedMenuItem == "Count") {
		$('#overview-total-count').html(data.overview_total_count);
		$('#overview-completed-count').html(data.overview_completed_count);
	} else {
		$('#total-lines').html(data.total_lines);
		$('#total-success').html(data.total_success);
		$('#total-failures').html(data.total_failures);
		$('#total-time-days').html(data.total_time_taken.days);
		$('#total-time-hours').html(data.total_time_taken.hours);
		$('#total-time-minutes').html(data.total_time_taken.minutes);
		$('#total-time-seconds').html(data.total_time_taken.seconds);
	}
}

let countChartInstance = null;
let statusChartInstance = null;

/*****E-Charts function start*****/
var echartsConfig = function(data) {
	const success = data.total_success;
	const failures = data.total_failures;
	const statusData = data.status_data;
	
	if(statusData.length > 0) {
		if( $('#status-chart').length > 0 ){

			// If status chart instance doesn't exist, create it
			if (!statusChartInstance) {
				statusChartInstance = echarts.init(document.getElementById('status-chart'));
			}
		
			var statusChartOptions = {
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
						name: 'Status',
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
			statusChartInstance.setOption(statusChartOptions);
			statusChartInstance.resize();
		}
	}

	if(success && failures) {
		if( $('#count-chart').length > 0 ){
	
			// If count chart instance doesn't exist, create it
			if (!countChartInstance) {
				countChartInstance = echarts.init(document.getElementById('count-chart'));
			}
			var countChartOptions = {
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
			countChartInstance.setOption(countChartOptions);
			countChartInstance.resize();;
		}
	}
}
/*****E-Charts function end*****/

function updateCharts(data) {
	echartsConfig(data);
}

function updateDataTable(data) {
	let selectedMenuItem = $('.side-menu.active').data('menu-item');
	var columnsInData = [];
	if (selectedMenuItem == "Count") {
		columnsInData = ['type', 'completed_count', 'total_count', 'progress'];
	} else {
		columnsInData = ['object_type(real_name)','object_type(display_name)', 'type_ofimport', 'machine_hostname', 'batch_name', 'count_of_lines_in_batch_file', 'status', 'successful_count', 'failure_count', 'time_taken'];
	}
	$('.dashboard-report-table-head-row').html('');
	var columnsToShow = [];
	$.each(columnsInData, function(index, value) {
		let title = value.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
        if (value === 'count_of_lines_in_batch_file') title = 'Count of Lines';
        if (value === 'type_ofimport') title = 'Type of Import';

		$('.dashboard-report-table-head-row').append('<th>'+title+'</th>');

        columnsToShow.push({ data: value, title: title });
	});
	
	$('#dashboard-report-table').DataTable({
		data: data,
		destroy: true,
		pageLength: 5,
		columns: columnsToShow,
		dom: 'Bfrtip',
		buttons: [
			// 'copy', 'csv', 'excel', 'pdf', 'print'
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

function clearAll() {
	clearTotals();
    clearCharts();
    clearDataTable();	
}

// Function to clear the totals
function clearTotals() {
	$('#total-lines').html('0');
    $('#total-success').html('0');
    $('#total-failures').html('0');
    $('#total-time-days').html('0');
    $('#total-time-hours').html('0');
    $('#total-time-minutes').html('0');
    $('#total-time-seconds').html('0');
    $('#overview-total-count').html('0');
    $('#overview-completed-count').html('0');
}

// Function to clear the charts
function clearCharts() {

    if (statusChartInstance) {
        statusChartInstance.clear();
    }

    if (countChartInstance) {
        countChartInstance.clear();
    }
}

// Function to clear the DataTable
function clearDataTable() {
	if ($.fn.dataTable.isDataTable('#dashboard-report-table')) {
    	$('#dashboard-report-table').DataTable().clear().destroy();
	}
}