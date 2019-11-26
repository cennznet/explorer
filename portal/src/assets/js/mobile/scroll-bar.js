$(function scrollBar() {

	var scrollBarWrapper = $(".scroll-bar-wrapper");
	var scrollBarTarget = $(".scroll-bar-target");

	scrollBarWrapper.css("width", scrollBarTarget.find(".scroll-bar-target__main").width());
	$(".scroll-bar-div").css("width", scrollBarTarget.find(".scroll-bar-target__main-body").width());
	scrollBarWrapper.scroll(() => {
		scrollBarTarget.find(".scroll-bar-target__main")
			.scrollLeft(scrollBarWrapper.scrollLeft());
	});
	scrollBarTarget.find(".scroll-bar-target__main").scroll(() => {
		scrollBarWrapper
			.scrollLeft(scrollBarTarget.find(".scroll-bar-target__main").scrollLeft());
	});
});