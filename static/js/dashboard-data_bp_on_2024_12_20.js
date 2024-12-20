/*Dashboard Init*/
 
"use strict"; 

/*****Ready function end*****/

/*****Load function start*****/
// $(window).on("load",function(){
// 	window.setTimeout(function(){
// 		$.toast({
// 			heading: 'Welcome to Goofy',
// 			text: 'Use the predefined ones, or specify a custom position object.',
// 			position: 'bottom-left',
// 			loaderBg:'#e58b25',
// 			icon: '',
// 			hideAfter: 3500, 
// 			stack: 6
// 		});
// 	}, 3000);
// });
/*****Load function* end*****/


// function updateFilters() {
// 	$.ajax({
// 		type: 'POST',
// 		url: '/filters/filter-data',
// 		data: {},
// 		success: function(response) {
// 			// Populate status filter options if needed
// 			// $('#filter-status').empty();
// 			const typeOfImport = [...new Set(response.map(d => d['type_ofimport']))];
// 			console.log(typeOfImport);
			
// 			typeOfImport.forEach(type => {
// 				if(type) {
// 					$('#type-of-import-filter').append(`<option value="${type}">${type}</option>`);
// 				}
// 			});

// 			const batchName = [...new Set(response.map(d => d['batch_name']))];
			
// 			batchName.forEach(name => {
// 				if(name) {
// 					$('#batch-name-filter').append(`<option value="${name}">${name}</option>`);
// 				}
// 			});

// 			const objectType = [...new Set(response.map(d => d['object_type(real_name)']))];
			
// 			objectType.forEach(object_type => {
// 				if(object_type) {
// 					$('#object-type-filter').append(`<option value="${object_type}">${object_type}</option>`);
// 				}
// 			});
// 		},
// 		error: function(error) {
//             console.error("Error in AJAX request:", error);
//         }
// 	});
// }

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
	// if(["type_of_import_filter", "batch_name_filter"].includes($(this).attr("name"))) {
	// 	getFilterData($(this).attr("name"));
	// }
});


// function updateFilters() {
//     $.ajax({
//         type: 'POST',
//         url: '/filters/filter-data',
//         data: {},
// 		beforeSend: function() {
//             $('.preloader-it').show();
//         },
//         complete: function() {
//             $('.preloader-it').hide();
//         },
//     	success:function(response) {
// 			// Handle Type of Import filter
// 			const typeOfImport = [...new Set(response.map(d => d['type_ofimport']))];  // Get unique values for type_of_import
// 			$('#type-of-import-filter').empty(); // Clear existing options
// 			$('#type-of-import-filter').append('<option value="">All</option>'); // Add 'All' option
// 			typeOfImport.forEach(type => {
// 				if (type) {
// 					$('#type-of-import-filter').append(`<option value="${type}">${type}</option>`);
// 				}
// 			});

// 			$('#type-of-import-filter').selectpicker('refresh');

// 			// Handle Batch Name filter
// 			const batchName = [...new Set(response.map(d => d['batch_name']))];  // Get unique values for batch_name
// 			$('#batch-name-filter').empty(); // Clear existing options
// 			$('#batch-name-filter').append('<option value="">All</option>'); // Add 'All' option
// 			batchName.forEach(name => {
// 				if (name) {
// 					$('#batch-name-filter').append(`<option value="${name}">${name}</option>`);
// 				}
// 			});

// 			$('#batch-name-filter').selectpicker('refresh');

// 			// Handle Object Type filter
// 			const objectType = [...new Set(response.map(d => d['object_type(real_name)']))];  // Get unique values for object_type
// 			$('#object-type-filter').empty(); // Clear existing options
// 			$('#object-type-filter').append('<option value="">All</option>'); // Add 'All' option
// 			objectType.forEach(object_type => {
// 				if (object_type) {
// 					$('#object-type-filter').append(`<option value="${object_type}">${object_type}</option>`);
// 				}
// 			});

// 			$('#object-type-filter').selectpicker('refresh');
// 		},
// 		error: function(error) {
//             console.error("Error in AJAX request:", error);
//         }
// 	});
// }


// updateFilters();

// Function to submit the form with POST method and reload the page with new filters
$('#filter-form').submit(function(event) {
	event.preventDefault();
	getData($(this));
});

// function getData(formElement) {
// 	const formData = formElement.serialize();
// 	// getDataUrl = $('#filter-form').attr('action');
// 	$.ajax({
// 		type: 'POST',
// 		url: '/dashboard/get-data',
// 		data: formData,
// 		success: function(response) {
// 			// Populate charts and DataTable with new filtered data
// 			totals = response.totals
// 			data = response.data
// 			updateTotals(totals);
// 			updateCharts(totals);
// 			updateDataTable(data);
// 		}
// 	});
// }

function updateTypeOfImportFilter(data) {
	const typeOfImport = [...new Set(data.map(d => d['type_ofimport']))];
	$('#type-of-import-filter').empty();
	$('#type-of-import-filter').append('<option value="">All</option>');
	typeOfImport.forEach(type => {
		if (type) {
			$('#type-of-import-filter').append(`<option value="${type}">${type}</option>`);
		}
	});

	$('#type-of-import-filter').selectpicker('refresh');
}

function updateBatchNameFilter(data) {
	const batchName = [...new Set(data.map(d => d['batch_name']))];
	$('#batch-name-filter').empty();
	$('#batch-name-filter').append('<option value="">All</option>');
	batchName.forEach(name => {
		if (name) {
			$('#batch-name-filter').append(`<option value="${name}">${name}</option>`);
		}
	});

	$('#batch-name-filter').selectpicker('refresh');
}

function updateObjectTypeFilter(data) {
	const objectType = [...new Set(data.map(d => d['object_type(real_name)']))];
	$('#object-type-filter').empty();
	$('#object-type-filter').append('<option value="">All</option>');
	objectType.forEach(object_type => {
		if (object_type) {
			$('#object-type-filter').append(`<option value="${object_type}">${object_type}</option>`);
		}
	});

	$('#object-type-filter').selectpicker('refresh');
}

function updateFilterValues(data, selectedFilter) {

	if(["type_of_import_filter"].includes(selectedFilter)) {
		updateBatchNameFilter(data);
		updateObjectTypeFilter(data);
	}

	if(["batch_name_filter"].includes(selectedFilter)) {
		updateObjectTypeFilter(data);
	}

	if (selectedFilter == "") {
		updateTypeOfImportFilter(data);
		updateBatchNameFilter(data);
		updateObjectTypeFilter(data);
	}
}

function getFilterData(selectedFilter) {
    const formData = new FormData();

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
			// $('#filter-submit-button').attr("disabled", "disabled");
        },
        complete: function() {
            $('.preloader-it').hide();
			// $('#filter-submit-button').removeAttr("disabled");
        },
    	success:function(response) {
			const data = response.data;
			const totals = response.totals;
			updateFilterValues(data, selectedFilter);
			updateTotals(totals);
			updateCharts(totals);
			updateDataTable(data);
			// if (selectedFilter == "") {
			// 	updateTotals(totals);
			// 	updateCharts(totals);
			// 	updateDataTable(data);
			// }
		},
		error: function(error) {
            console.error("Error in AJAX request:", error);
        }
		
	});
	console.log("finished", {depth:null});
}

getFilterData("");


// function getData(formElement) {
//     // Create a plain object to store form data
//     const formData = new FormData(formElement[0]);

//     // Append the selected values of each multi-select dropdown
//     const typeOfImport = $('#type-of-import-filter').val();
//     const batchName = $('#batch-name-filter').val();
//     const objectType = $('#object-type-filter').val();

//     // Add multi-select values to FormData object
//     formData.append('type_of_import', typeOfImport ? typeOfImport : []);
//     formData.append('batch_name', batchName ? batchName : []);
//     formData.append('object_type', objectType ? objectType : []);

//     // Make AJAX request
//     $.ajax({
//         type: 'POST',
//         url: '/dashboard/get-data',
//         data: formData,
//         processData: false, // Prevent jQuery from converting the data
//         contentType: false, // Set content type to form-data
// 		beforeSend: function() {
//             $('.preloader-it').show();
// 			$('#filter-submit-button').attr("disabled", "disabled");
//         },
//         complete: function() {
//             $('.preloader-it').hide();
// 			$('#filter-submit-button').removeAttr("disabled");
//         },
//     	success:function(response) {
//             // Populate charts and DataTable with new filtered data
//             const totals = response.totals;
//             const data = response.data;
//             updateTotals(totals);
//             updateCharts(totals);
//             updateDataTable(data);
// 		},
// 		error: function(error) {
//             console.error("Error in AJAX request:", error);
//         }
// 	});
// }


// getData($('#filter-form'));

function updateTotals(data) {
	// $('#total-batches').html(data.total_batches);
	$('#total-lines').html(data.total_lines);
	$('#total-success').html(data.total_success);
	$('#total-failures').html(data.total_failures);
	$('#total-time-days').html(data.total_time_taken.days);
	$('#total-time-hours').html(data.total_time_taken.hours);
	$('#total-time-minutes').html(data.total_time_taken.days);
	$('#total-time-seconds').html(data.total_time_taken.seconds);
	console.log(data, {depth:null});
	

	// $('#total-lines').html(isNaN(data.total_lines) ? 0 : data.total_lines);
    // $('#total-success').html(isNaN(data.total_success) ? 0 : data.total_success);
    // $('#total-failures').html(isNaN(data.total_failures) ? 0 : data.total_failures);
    // $('#total-time-days').html(isNaN(data.total_time_taken.days) ? 0 : data.total_time_taken.days);
    // $('#total-time-hours').html(isNaN(data.total_time_taken.hours) ? 0 : data.total_time_taken.hours);
    // $('#total-time-minutes').html(isNaN(data.total_time_taken.minutes) ? 0 : data.total_time_taken.minutes);
    // $('#total-time-seconds').html(isNaN(data.total_time_taken.seconds) ? 0 : data.total_time_taken.seconds);

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
			// color: ['#0FC5BB', '#92F2EF', '#D0F6F5'],
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
		var data = [];
		var labelData = [];
		for (var i = 0; i < 24; ++i) {
			data.push({
				value: Math.random() * 10 + 10 - Math.abs(i - 12),
				name: i + ':00'
			});
			labelData.push({
				value: 1,
				name: i + ':00'
			});
		}

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
					// color: ['#0FC5BB', '#92F2EF'],
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
					// color: ['#0FC5BB', '#D0F6F5'],
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

/*****Resize function start*****/
// var echartResize;
// $(window).on("resize", function () {
// 	/*E-Chart Resize*/
// 	clearTimeout(echartResize);
// 	echartResize = setTimeout(echartsConfig, 200);
// }).resize(); 
/*****Resize function end*****/


function updateCharts(data) {

	echartsConfig(data);
	// const labels = data.map(d => d['batch_name']);
	// const success = data.map(d => d['successful_count']);
	// const failures = data.map(d => d['failure_count']);

	// if (barChartInstance) {
	// 	barChartInstance.destroy();
	// }

	// barChartInstance = new Chart(document.getElementById('barChart'), {
	// 	type: 'bar',
	// 	data: {
	// 		labels: labels,
	// 		datasets: [
	// 			{ label: 'Success', data: success, backgroundColor: 'green' },
	// 			{ label: 'Failures', data: failures, backgroundColor: 'red' }
	// 		]
	// 	}
	// });

	// new Chart(document.getElementById('pieChart'), {
	//     type: 'pie',
	//     data: {
	//         labels: labels,
	//         datasets: [{ data: success, backgroundColor: ['blue', 'orange', 'purple', 'green', 'red'] }]
	//     }
	// });

	// new Chart(document.getElementById('donutChart'), {
	//     type: 'doughnut',
	//     data: {
	//         labels: labels,
	//         datasets: [{ data: failures, backgroundColor: ['yellow', 'pink', 'cyan', 'teal', 'gray'] }]
	//     }
	// });

	// new Chart(document.getElementById('lineChart'), {
	//     type: 'line',
	//     data: {
	//         labels: labels,
	//         datasets: [
	//             { label: 'Success', data: success, borderColor: 'green', fill: false },
	//             { label: 'Failures', data: failures, borderColor: 'red', fill: false }
	//         ]
	//     },
	//     options: { scales: { x: { stacked: true }, y: { stacked: true } } }
	// });
}

function updateDataTable(data) {
	$('#dashboard-report-table').DataTable({
		data: data,
		destroy: true,
		// fixedColumns: {
		// 	start: 2
		// },
		// width: "100%",
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
