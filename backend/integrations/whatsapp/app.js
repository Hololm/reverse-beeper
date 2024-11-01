const express = require('express');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const client = new Client();

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

let latestQR = null;

io.on('connection', (socket) => {
    console.log('A user connected');

    if (latestQR) {
        socket.emit('qr', latestQR);
    }

    socket.on('sendMessage', async (data) => {
        const { number, message } = data;
        try {
            const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;
            await client.sendMessage(formattedNumber, message);
            io.emit('messageSent', { success: true, message: 'Message sent successfully' });
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('messageSent', { success: false, message: 'Failed to send message' });
        }
    });
});

client.on('qr', async (qr) => {
    latestQR = await qrcode.toDataURL(qr);
    io.emit('qr', latestQR);
});

client.on('ready', () => {
    console.log('Client is ready!');
    io.emit('ready', 'WhatsApp is ready!');
});

client.on('message_create', async (message) => {
    if (message.fromMe) return; // Ignore messages sent by you

    console.log('New message received:', message.body);

    // Broadcast the received message to all connected clients
    io.emit('messageReceived', {
        from: message.from,
        body: message.body
    });

    // Example of auto-reply
    if (message.body.toLowerCase() === '!ping') {
        await client.sendMessage(message.from, 'pong');
    }
});

client.initialize();

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});