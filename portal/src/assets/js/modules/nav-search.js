const searchBox = $('.nav-search');
const inputBox = searchBox.find('input');
const errorMsg = searchBox.find('.error-message');
const ctlClass = 'nav-search--closed';
const hiddenClass = 'hide';

searchBox.on('click', '.fa-search', () => {
	inputBox.focus();
	searchBox.removeClass(ctlClass);
});

inputBox.on('blur', () => {
	errorMsg.addClass(hiddenClass);
	searchBox.addClass(ctlClass);
});

inputBox.on('transitionend', () => {
	if (searchBox.hasClass(ctlClass)) {
		inputBox.val('');
		errorMsg.addClass(hiddenClass);
	}
});

