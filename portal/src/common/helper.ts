import * as fs from 'fs';
import * as path from 'path';

let manifest;

try {
	const file = path.join(__dirname, '../../public/manifest.json');
	const content = fs.readFileSync(file).toString();
	manifest = JSON.parse(content);
} catch (err) {
	manifest = {};
}

export const asset = (file: string): string => {
	const publicPath = process.env.APP_CDN_URL || '/';
	if (process.env.NODE_ENV === 'local') {
		return publicPath + file;
	}
	return manifest[file] || publicPath + file;
};

export const isObjectEmpty = (input: object): boolean => {
	for(const key in input) {
		if (input.hasOwnProperty(key)) {
			return false;
		}
	}
	return true;
};
