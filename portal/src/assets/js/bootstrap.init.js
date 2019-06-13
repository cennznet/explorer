import 'bootstrap/dist/js/bootstrap.bundle';
import 'bootstrap-select';
import 'bootstrap-datepicker';
import 'slick-carousel/slick/slick';

$('[data-toggle="tooltip"]').tooltip();

$('.datepicker').datepicker({
	format: 'dd/mm/yyyy',
	autoclose: true,
	clearBtn: true,
	language: 'en',
	todayHighlight: true,
	endDate: 'today',
	weekStart: 1,
	startDate: '01/01/2019'
});