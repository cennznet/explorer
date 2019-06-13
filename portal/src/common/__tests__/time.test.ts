import { humanReadableTime } from '../time';

describe('humanReadableTime', () => {
	it('should return seconds when < 1min', () => {
		const preTimestamp = new Date().getTime();
		const res = humanReadableTime(preTimestamp);
		expect(/^\d+ secs ago$/.test(res.toString())).toBeTruthy();
	});

	it('should return minute when = 1min', () => {
		const preTimestamp = Math.round(new Date().getTime()/1000 - 70);
		const res = humanReadableTime(preTimestamp);
		expect(/^\d+ min ago$/.test(res.toString())).toBeTruthy();
	});

	it('should return minutes when > 1min and < 1hr ', () => {
		const preTimestamp = Math.round(new Date().getTime()/1000 - 3000);
		const res = humanReadableTime(preTimestamp);
		expect(/^\d+ mins ago$/.test(res.toString())).toBeTruthy();
	});

	it('should return hour when = 1hr', () => {
		const preTimestamp = Math.round(new Date().getTime()/1000 - 3600);
		const res = humanReadableTime(preTimestamp);
		expect(/^\d+ hr ago$/.test(res.toString())).toBeTruthy();
	});

	it('should return hours when > 1hr and < 24hrs', () => {
		const preTimestamp = Math.round(new Date().getTime()/1000 - 7200);
		const res = humanReadableTime(preTimestamp);
		expect(/^\d+ hrs ago$/.test(res.toString())).toBeTruthy();
	});

	it('should return UTC date when >= 24hrs', () => {
		const preTimestamp = Math.round(new Date().getTime()/1000 - 86400);
		const res = humanReadableTime(preTimestamp);
		expect(res).toBe(new Date(preTimestamp * 1000).toUTCString());
	});

	it('should return correct value', () => {
		const correctValue = '17/01/2019 11:47 PM';
		const preTimestamp = 1550447262;
		const res = humanReadableTime(preTimestamp);
		expect(res).toBe(correctValue);
	});
});
