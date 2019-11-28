$(function scrollBar() {

	var scrollBarWrapper = $(".scroll-bar-wrapper");
	var mobileWrapperTxTable = $(".mobile-wrapper-tx-table");

	if (!mobileWrapperTxTable) return;

	scrollBarWrapper.css("width", mobileWrapperTxTable.find(".tx-table").width());
	$(".scroll-bar-div").css("width", mobileWrapperTxTable.find(".general-table").width());
	scrollBarWrapper.scroll(() => {
		mobileWrapperTxTable.find(".tx-table")
			.scrollLeft(scrollBarWrapper.scrollLeft());
	});
	mobileWrapperTxTable.find(".tx-table").scroll(() => {
		scrollBarWrapper
			.scrollLeft(mobileWrapperTxTable.find(".tx-table").scrollLeft());
	});
});

$(function scrollBar2() {

	var scrollBarWrapper = $(".scroll-bar-wrapper");
	var mobileWrapperBlockTable = $(".mobile-wrapper-block-table");

	if (!mobileWrapperBlockTable) return;

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
});