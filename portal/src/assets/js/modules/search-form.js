const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc)

$('#search-form').on('submit', e => {
	e.preventDefault();
	const node = $(e.target);
	const url = node.attr('action');
	var asset = $('#asset-info').attr('asset-selected');
	const hash = Object.create(null);
	const query = node
		.serializeArray()
		.filter(item => !!item.value)
		.reduce(function (res, item) {
			if (!hash[item['name']]) {
				hash[item['name']] = {};
				hash[item['name']]['name'] = item['name'];
				res.push(hash[item['name']]);
			}
			hash[item['name']].value = hash[item['name']].value ? hash[item['name']].value + ',' + item.value : item.value;
			return res;
		}, [])
		.map(item => {
			if(item.name === 'startDate') {
				const startDate = new Date(item.value.split('/').reverse().join('/'));
				return item.name + '=' + dayjs(startDate).startOf('day').unix();
			}
			if(item.name === 'endDate') {
				const startDate = new Date(item.value.split('/').reverse().join('/'));
				return item.name + '=' + dayjs(startDate).endOf('day').unix();
			}
			return item.name + '=' + item.value;
		})
		.join('&');
	if(!asset) { 
		asset = '' 
	}
	if(query && asset) { 
		asset = asset + '&' 
	}
	if(!query) {
		window.location.href = url + '?' + asset;
	} else {
		window.location.href = url + '?' + asset + query;
	}

});

$('.form-control').each((idx, item) => {
	const t = item.dataset.time;
	if(t) {
		$(item).val(dayjs(t*1000).format('DD/MM/YYYY'));
	}
});

$('#search-form').on('click', '.btn-link', () => {

	const url = $('#search-form').attr('action'); 
	var asset = $('#asset-info').attr('asset-selected');

	const txType = $('#txTypes');
	if(txType) {
		txType.val('').selectpicker('refresh');
	}

	const txFlow = $('#txFlow');
	if(txFlow) {
		txFlow.val('').selectpicker('refresh');
	}

	const startDate = $('[name=startDate]');
	if(startDate) {
		startDate.datepicker('setDate', null);
	}

	const endDate = $('[name=endDate]');
	if(endDate) {
		endDate.datepicker('setDate', null);
	}

	const assetType = $('#assetType');
	if(assetType) {
		assetType.val('').selectpicker('refresh');
	}

	const assetSelect = $('#asset');
	if(assetSelect) {
		assetSelect.val('').selectpicker('refresh');
	}

	if(asset) { 
		asset = '?' + asset
	} else {
		asset = ''
	}

	window.location.href = url + asset;
});
