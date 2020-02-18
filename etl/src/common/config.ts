import { readFileSync } from 'fs';
import { get } from 'lodash';
import { join } from 'path';

const settingsData = readFileSync(join(__dirname, '../../settings/appsettings.json'));
const secretsData = readFileSync(join(__dirname, '../../secrets/secrets.json'));

let settings;
try {
    settings = JSON.parse(settingsData.toString());
} catch (err) {
    settings = {};
}

let secrets;
try {
    secrets = JSON.parse(secretsData.toString());
} catch (err) {
    secrets = {};
}
export const config = {
    get: (key: string, defaultValue?: any): any => {
        return (
            process.env[key.toUpperCase()] ||
            get(settings, key, defaultValue) ||
            get(secrets, key, defaultValue)
        );
    },
};
