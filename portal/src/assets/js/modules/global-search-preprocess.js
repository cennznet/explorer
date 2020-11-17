const errorMsgSpan = $('.global-search').find('.error-message');
const inputBox = $('.global-search').find('input');
const hiddenClass = 'hide';
$('.global-search').on('submit', e => {
	e.preventDefault();
	const node = $(e.target);
	const url = node.attr('action');
	const searchValue = node.find('input').val();
	if(searchValue){
		if((/^[0-9a-zA-Z]{48}$/.test(searchValue)) || (/^0x[0-9a-fA-F]{64}$/.test(searchValue)) || (/^[0-9]*$/.test(searchValue))) {
			window.location.href = url + '?q=' + searchValue;
		} else {
			errorMsgSpan.removeClass(hiddenClass);
		}
	} else {
		errorMsgSpan.removeClass(hiddenClass);
	}
});

inputBox.on('keydown', () => {
	errorMsgSpan.addClass(hiddenClass);
});
