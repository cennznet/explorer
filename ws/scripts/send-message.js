const io = require('socket.io-client');
const notifySocket = io.connect('http://localhost:3000/notify');
notifySocket.on('connect', () => {
	console.log('success');
})
notifySocket.on('error', console.log);
notifySocket.on('connect_error', console.log);
notifySocket.on('connect_timeout', console.log);
setInterval(() => {

    notifySocket.emit('message', {blockNumber: 3500},  (data) => {
        console.log(data);
    });

}, 1000);

