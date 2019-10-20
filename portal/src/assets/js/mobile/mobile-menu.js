$(function () {

	let activeMenuItem;

	$('#mobileMenuSearchBox').parent().css('border-radius', 0);

	const originalSearchBoxParentBackgroundColor = $('#mobileMenuSearchBoxParent').css('background-color');

	const reset = () => $('#mobileMenuSearchBoxParent').css('background-color', originalSearchBoxParentBackgroundColor);


	$('#mobileMenuSearchBox').on('blur', () => {
		reset();
	})

	let $menu = $('#navbarSupportedContent');
	$(document).on('click', (e) => {

		if (justOpened) {
			return;
		}

		var menuIsClosed = $('#navbarSupportedContent').hasClass('collapse');

		if (!menuIsClosed) {
			if (
				// clicked outside menu
				!$menu.is(e.target) && !$menu.has(e.target).length) {
				// hide the menu
				$('#navbarSupportedContent').addClass('collapse');
				$('#navbarSupportedContent').fadeOut('fast');
				// ensure home is not not showing the error box
				$('.error-message').addClass('hide');
			}
		}
	});

	let justOpened = false;

	// hide or show the mobile menu when the hamburger icon is clicked
	$("#hamburgerIcon").on('click', () => {
			//menu is closed
			if ($('#navbarSupportedContent').hasClass('collapse')) {
				// put active menu item style back
				if (activeMenuItem) {
					activeMenuItem.addClass('active');
				}

				justOpened = true;
				// clear out last search value
				$('#mobileMenuSearchBox').val('');
				setTimeout(() => {
					justOpened = false
				}, 100)

				// fade in the menu
				$('#navbarSupportedContent').fadeIn('fast');
				// add legacy open css
				$('#navbarSupportedContent').removeClass('collapse');

			} else {
				$('#navbarSupportedContent').fadeOut('fast');
				// add legacy close css
				$('#navbarSupportedContent').addClass('collapse');
			}

			// ensure home is not not showing the error box
			$('.error-message').addClass('hide');
		}
	);

	$("#mobileMenuSearchBoxParent").on('click', () => {
		$("#mobileMenuSearchBox").focus()
	})

	// remove the selected background color of the active menu item when the user clicks in the search input
	$("#mobileMenuSearchBox").on('focus', () => {
			// make the background color of the input form same active color
			$('#mobileMenuSearchBoxParent').css('background-color', '#45C7D2');

			// remember active menu item so the color can bet set back, they will only ever be one active
			const maybeAnActiveMenuItem = $('.mobile-menu .nav-item.active');
			if (maybeAnActiveMenuItem.length > 0) {
				activeMenuItem = maybeAnActiveMenuItem;
				activeMenuItem.removeClass('active');
			}
		}
	)

});

