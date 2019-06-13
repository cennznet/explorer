import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { get } from 'lodash';
import { join } from 'path';

dotenv.config();

const settingsData = readFileSync(join(__dirname, '../../settings/appsettings.json'));

let settings;
try {
	settings = JSON.parse(settingsData.toString());
} catch (err) {
	settings = {};
}

export const config = {
	get: (key: string, defaultValue?: any): any => {
		return process.env[key.toUpperCase()] || get(settings, key, defaultValue);
	},
};
