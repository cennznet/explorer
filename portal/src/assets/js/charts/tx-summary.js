import * as echarts from 'echarts/index.simple';

const node = document.getElementById('tx-chart');
const monthNames = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec',
];
const weekDays = [
	'Sun',
	'Mon',
	'Tue',
	'Wed',
	'Thu',
	'Fri',
	'Sat',
];
function getOptions(labels, data) {
	return {
		title: false,
		tooltip: {show: false},
		textStyle: {fontFamily: 'Open Sans'},	
		legend: {show:false},
		xAxis: {
			type: 'category',
			boundaryGap: true,
			data: labels.map(function (str) {
				return str.replace('-', '\n')
			}),
			axisLine: {show: false},
			axisTick: {show: false},
			axisLabel: {margin: 10},
			splitLine: {show: true}
		},
		yAxis: {
			type: 'value',
			axisLine: {show: false},
			axisTick: {show: false},
			axisLabel: {margin: 10},
			splitLine: {show: true}
		},
		grid: {
			show: true,
			top: '8px',
			left: '50px',
			right: '15px',			
		},
		series: [
			{
				data,
				type: 'line',
				smooth: true,
				showSymbol: false,
				areaStyle: {
					color:  '#1130FF',
					opacity: 0.1,
				},
				lineStyle: {
					width: 4,
					color: '#1130FF',
				},				
			},
		],
	};
}

if (node) {
	const myChart = echarts.init(node);
	const stats = $(node)
		.parents('.chart-block')
		.data('stat');

	stats.last24H.datetime = stats.last24H.datetime.map(d => {
		const date = new Date(d);
		const hr = date.getHours();
		return `${hr}:00`;
	});

	stats.last7D.datetime = stats.last7D.datetime.map(d => {
		const date = new Date(d);
		const weekday = weekDays[date.getDay()];
		const hr = date.getHours();
		return `${hr}:00-${weekday}`;
	});

	stats.last30D.datetime = stats.last30D.datetime.map(d => {
		const date = new Date(d);
		const month = monthNames[date.getMonth()];
		const day = date.getDate();
		return `${day} ${month}`;
	});

	myChart.setOption(getOptions(stats.last24H.datetime, stats.last24H.transactionCount));

	$('.chart-block__switch button').on('click', e => {
		const el = $(e.target);
		el.addClass('active').siblings('button').removeClass('active');
		const type = el.data('type');
		const options = getOptions(stats[type].datetime, stats[type].transactionCount);
		myChart.setOption(options);
	});
}
