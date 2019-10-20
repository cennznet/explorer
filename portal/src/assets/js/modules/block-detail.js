$('.block-detail .hide-validators').on('click', ()  => {
	$('.hide-validators').parent().addClass('hide-important');
	$('.show-validators').parent().removeClass('hide-important');
})

$('.block-detail .show-validators').on('click', ()  => {
	$('.hide-validators').parent().removeClass('hide-important');
	$('.show-validators').parent().addClass('hide-important');
})
