$(document).ready(() => {
	let url = new URL(document.location);
	let params = url.searchParams;
	let asset = params.get('asset');

	if (asset !== null) {
		$("#txTokens").val(asset).attr("selected","selected");
	}

	$('#txTokens').on('change', txTokens => {
		window.location.url = '?asset=' + $(txTokens.currentTarget).val();
		window.location.href = window.location.url;
	});
});
