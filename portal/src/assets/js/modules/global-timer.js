import { humanReadableTime } from '../../../common/time';
setInterval(() => {
	$('.anim-time').each((idx, item) => {
		const t = item.dataset.time;
		item.innerHTML = humanReadableTime(t);
	});
}, 1000);
