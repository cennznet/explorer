const blockInfo = $('.block-detail');
const hideClass = 'hide';
blockInfo.on('click', '.hide-validators', (e) => {
	e.preventDefault();
	const target = $(e.currentTarget);
	target.parent('dd').addClass(hideClass);
	const hideIcon = $('.show-validators');
	hideIcon.parent('dd').removeClass(hideClass);
	$('.block-validator').addClass(hideClass);
});

blockInfo.on('click', '.show-validators', (e) => {
	e.preventDefault();
	const target = $(e.currentTarget);
	target.parent('dd').addClass(hideClass);
	const hideIcon = $('.hide-validators');
	hideIcon.parent('dd').removeClass(hideClass);
	$('.block-validator').removeClass(hideClass);
});
