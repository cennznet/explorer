$(function scrollBar() {

	var scrollBarWrapper = $(".scroll-bar-wrapper");
	var mobileWrapperTxTable = $(".mobile-wrapper-tx-table");

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
