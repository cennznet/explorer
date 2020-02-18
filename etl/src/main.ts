import { createServer } from 'http';
import { config } from './common/config';
import { listen } from './service/indexer.service';

(async () => {
    const server = createServer((req, res) => {
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'OK' }));
    });
    server.listen(config.get('app.port', 3000));
    await listen();
})();
