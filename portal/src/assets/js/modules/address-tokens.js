const prevObj = $('.list-prev');
const nextObj = $('.list-next');
$('.token-grid-wrapper').slick({
	slidesToShow: 4.5,
	slidesToScroll: 1,
	prevArrow: prevObj,
	nextArrow: nextObj
});

const viewOptions = $('.view-options');
const gridView = $('.token-grid');
const listView = $('.token-list');
const disableGridView = 'token-grid--hidden';
const disableListView = 'token-list--hidden';
const selected = 'selected';
viewOptions.on('click', '.fa-th', (e) => {
	gridView.removeClass(disableGridView);
	listView.addClass(disableListView);
	const gridBtn = $(e.currentTarget);
	gridBtn.addClass(selected);
	gridBtn.siblings('.fa-list').removeClass(selected);
});

viewOptions.on('click', '.fa-list', (e) => {
	gridView.addClass(disableGridView);
	listView.removeClass(disableListView);
	const listBtn = $(e.currentTarget);
	listBtn.addClass(selected);
	listBtn.siblings('.fa-th').removeClass(selected);
});

$('.slick-next').on('click', (e) => {
	e.preventDefault();
});

$('.slick-prev').on('click', (e) => {
	e.preventDefault();
});
