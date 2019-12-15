$(function scrollBar() {

	var scrollBarWrapper = $(".scroll-bar-wrapper");
	var mobileWrapperTxTable = $(".mobile-wrapper-tx-table");
	var mobileWrapperBlockTable = $(".mobile-wrapper-block-table");

	scrollBarWrapper.css("width", mobileWrapperTxTable.find(".tx-table").width());
	scrollBarWrapper.css("width", mobileWrapperTxTable.find(".stmt-table").width());
	$(".scroll-bar-div").css("width", mobileWrapperTxTable.find(".general-table").width());
	scrollBarWrapper.scroll(() => {
		mobileWrapperTxTable.find(".tx-table")
			.scrollLeft(scrollBarWrapper.scrollLeft());
		mobileWrapperTxTable.find(".stmt-table")
			.scrollLeft(scrollBarWrapper.scrollLeft());
	});
	mobileWrapperTxTable.find(".tx-table").scroll(() => {
		scrollBarWrapper
			.scrollLeft(mobileWrapperTxTable.find(".tx-table").scrollLeft());
	});
	mobileWrapperTxTable.find(".stmt-table").scroll(() => {
		scrollBarWrapper
			.scrollLeft(mobileWrapperTxTable.find(".stmt-table").scrollLeft());
	});

	scrollBarWrapper.css("width", mobileWrapperBlockTable.find(".block-table").width());
	$(".scroll-bar-div").css("width", mobileWrapperBlockTable.find(".general-table").width());
	scrollBarWrapper.scroll(() => {
		mobileWrapperBlockTable.find(".block-table")
			.scrollLeft(scrollBarWrapper.scrollLeft());
	});
	mobileWrapperBlockTable.find(".block-table").scroll(() => {
		scrollBarWrapper
			.scrollLeft(mobileWrapperBlockTable.find(".block-table").scrollLeft());
	});

	scrollBarWrapper.css("width", mobileWrapperBlockTable.find(".token-table").width());
	$(".scroll-bar-div").css("width", mobileWrapperBlockTable.find(".general-table").width());
	scrollBarWrapper.scroll(() => {
		mobileWrapperBlockTable.find(".token-table")
			.scrollLeft(scrollBarWrapper.scrollLeft());
	});
	mobileWrapperBlockTable.find(".token-table").scroll(() => {
		scrollBarWrapper
			.scrollLeft(mobileWrapperBlockTable.find(".token-table").scrollLeft());
	});
});
