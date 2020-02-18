const request = require('request');
import { config } from '../common/config';
import { logger } from '../common/logger';

interface IBlockMessage {
    blockNumber: number;
}

const HOST_URL: string = config.get('notifications.host');

export async function notify(msg: IBlockMessage) {
    if (HOST_URL === '') {
        return;
    }
    request.post({ url: HOST_URL, form: msg }, (error, response, body) => {
        if (error) {
            logger.warn('Notification error:', error);
        } else {
            logger.info(`Notification sent\tstatus code: ${response.statusCode}`);
        }
    });
}
