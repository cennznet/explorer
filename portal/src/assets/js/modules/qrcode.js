import QrCode from 'qrcode';

const container = document.getElementById('qr-code');
if (container) {
	const hash = $('#address-hash').text();
	const style = window.getComputedStyle(container);
	const width = Number(style.width.replace('px', ''));
	QrCode.toCanvas(container, hash, { width });
}

