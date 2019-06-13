import Clipboard from 'clipboard';

$('.copy-btn').each((idx, item) => {
	const clipboard = new Clipboard(item);
	clipboard.on('success', function(e) {
		$(item).attr('data-original-title', 'Copied')
			.tooltip('show');
		e.clearSelection();
	});
	$(item).on('mouseover', () => {
		$(item).attr('data-original-title', 'Copy to clipboard')
			.tooltip('show');
	});
	$(item).on('mouseout', () => {
			$(item).tooltip('hide');
	});
});




