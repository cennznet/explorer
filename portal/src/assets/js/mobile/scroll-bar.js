$(function scrollBar() {

	var scrollBarWrapper = $(".scroll-bar-wrapper");
	var scrollBarTarget = $(".scroll-bar-t");

	console.log(scrollBarTarget.find(".scroll-bar-t__main").width())
	console.log(scrollBarTarget.find(".scroll-bar-t__body").width())

	scrollBarWrapper.css("width", scrollBarTarget.find(".scroll-bar-t__main").width());
	$(".scroll-bar-div").css("width", scrollBarTarget.find(".scroll-bar-t__body").width());
	scrollBarWrapper.scroll(() => {
		scrollBarTarget.find(".scroll-bar-t__main")
			.scrollLeft(scrollBarWrapper.scrollLeft());
	});
	scrollBarTarget.find(".scroll-bar-t__main").scroll(() => {
		scrollBarWrapper
			.scrollLeft(scrollBarTarget.find(".scroll-bar-t__main").scrollLeft());
	});
});