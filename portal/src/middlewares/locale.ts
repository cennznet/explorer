import * as i18n from 'i18n';
import { join } from 'path';

export function locale() {
	i18n.configure({
		directory: join(__dirname, '../../locales'),
		defaultLocale: 'en',
	});
	return i18n.init;
}
