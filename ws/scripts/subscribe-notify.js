const io = require('socket.io-client');
const notifySocket = io.connect('http://localhost:3000/notify');
notifySocket.on('connect', () => {
    console.log('success');
})

notifySocket.on('latestBlock', data => {
    console.log(data);
});
