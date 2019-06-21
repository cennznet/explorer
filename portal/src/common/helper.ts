import * as fs from 'fs';
import * as path from 'path';
import { config } from './config';

let manifest;

try {
	const file = path.join(__dirname, '../../public/manifest.json');
	const content = fs.readFileSync(file).toString();
	manifest = JSON.parse(content);
} catch (err) {
	manifest = {};
}

export const asset = (file: string): string => {
	const publicPath = config.get('app.cdn', '');
	if (process.env.NODE_ENV === 'local') {
		return publicPath + '/' + file;
    }
    if(manifest[file]) {
        return publicPath + manifest[file];
    }
    return publicPath + '/' + file;
};

export const isObjectEmpty = (input: object): boolean => {
	for(const key in input) {
		if (input.hasOwnProperty(key)) {
			return false;
		}
	}
	return true;
};
