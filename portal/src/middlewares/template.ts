const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
import { Express } from 'express';
import * as expressNunjucks from 'express-nunjucks';
import * as i18n from 'i18n';
import { config } from '../common/config';
import { convertToLocales, short, shorten } from '../common/format';
import { asset } from '../common/helper';
import { humanReadableTime } from '../common/time';
import { txFlows, txTypes } from '../common/transaction-types';
import { toStdUnit } from '../common/unit-convert';

dayjs.extend(utc);

export function template(server: Express, isLocal: boolean) {
	return expressNunjucks(server, {
		watch: isLocal,
		noCache: isLocal,
		globals: {
			asset,
			getYear: () => new Date().getFullYear(),
			queryFor: url => {
				if (url.includes('?')) {
					if (url.endsWith('&') || url.endsWith('?')) {
						return url;
					} else {
						return url + '&';
					}
				} else {
					return url + '?';
				}
			},
			baseUrl: config.get('app.baseUrl', ''),
			_: (...args: any[]) => i18n.__.apply(null, args),
			chains: config.get('app.chains', []),
			txTypes,
			txFlows,
			theme: config.get('app.theme', 'main-net'),
			wsUrl: config.get('ws', ''),
			gAId: config.get('app.googleAnalytics', '')
		},
		filters: {
			json2str: JSON.stringify,
			ago: input => humanReadableTime(input),
			date: input => new Date(input * 1000).toUTCString(),
			short: input => short(input),
			numberFormat: input => input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
			shorten: input => shorten(input),
			toStdUnit: input => toStdUnit(input).toFormat(2),
			utcDate: input => dayjs.utc(input * 1000).format('DD-MMM-YYYY HH:mm:ss') + ' UTC',
			displayStatus: input => input === true ? 'Success' : 'Failure',
			displayCssClassStatus: input => input === true ? 'fa fa-check-circle check' : 'fa fa-times-circle cross'
		},
	});
}
