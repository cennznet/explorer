export function short(input: string) {
	const preStrip = /^0x/.test(input) ? 6 : 5;
	return input.substr(0, preStrip) + '...' + input.substr(input.length - 4)
}

export function convertToLocales(input: string) {
	const output = Number.parseFloat(input)
	return output.toLocaleString();
}

export function shorten(input: string) {
	const preStrip = /^0x/.test(input) ? 6 : 5;
	return input.substr(0, preStrip) + '...';
}
