const statementTable = $('.stmt-table');
const collapsedClass = 'stmt-table__row--collapsed';
const hiddenClass = 'stmt-table__content--hidden';

statementTable.on('click', '.fa-angle-down', e => {
	const el = $(e.target);
	const trParent = el.parents('tr');
	trParent.removeClass(collapsedClass);
	const trUncle = trParent.next('tr');
	trUncle.removeClass(hiddenClass);
});

statementTable.on('click', '.fa-angle-up', e => {
	const el = $(e.target);
	const trParent = el.parents('tr');
	trParent.addClass(collapsedClass);
	const trUncle = trParent.next('tr');
	trUncle.addClass(hiddenClass);
});
