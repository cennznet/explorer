const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc)

export function humanReadableTime(timestamp: number): string {
	const oneMinInSec = 60;
	const oneHrInSec = 3600;
	const twentyFourHrsInSec = 86400;
	let preTimestamp = timestamp;
	if(timestamp.toString().length === 10) {
		preTimestamp = timestamp * 1000;
	}
	const currentTimestamp = new Date().getTime();
	const diffInSeconds = Math.round((currentTimestamp - preTimestamp) / 1000);
	if (diffInSeconds < oneMinInSec) {
		return `${diffInSeconds} seconds ago`;
	}
	if(diffInSeconds >= oneMinInSec && diffInSeconds < oneHrInSec) {
		const min = Math.round(diffInSeconds / oneMinInSec);
		return min > 1 ? `${min} minutes ago` : `${min} minute ago`;
	}
	if(diffInSeconds >= oneHrInSec && diffInSeconds < twentyFourHrsInSec) {
		const hour = Math.round(diffInSeconds / oneHrInSec);
		return hour > 1 ? `${hour} hours ago` : `${hour} hour ago`;
	}
	return dayjs.utc(preTimestamp).format('DD-MMM-YYYY HH:mm:ss') + ' UTC';
}
