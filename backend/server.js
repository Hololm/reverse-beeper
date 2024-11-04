const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const { IgApiClient } = require('instagram-private-api');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: "http://localhost:8080", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

const igClient = new IgApiClient();
const waClient = new Client();

let waLatestQR = null;

// Instagram login
app.post('/login/instagram', async (req, res) => {
    const { username, password } = req.body;
    try {
        igClient.state.generateDevice(username);
        // Skip suggested searches flow
        const loggedInUser = await igClient.account.login(username, password);
        // Skip post login suggested searches
        res.json({ success: true, user: loggedInUser.username });
    } catch (error) {
        const errorMessage = error.response?.body?.message || error.message;
        res.status(400).json({
            success: false,
            error: errorMessage
        });
    }
});

// WhatsApp login (QR code generation)
app.get('/login/whatsapp', (req, res) => {
    if (waLatestQR) {
        res.json({ qr: waLatestQR });
    } else {
        res.status(404).json({ error: 'QR code not yet generated' });
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');

    // Instagram message sending
    socket.on('instagram:sendMessage', async (data) => {
        try {
            const thread = igClient.entity.directThread([data.userId.toString()]);
            await thread.broadcastText(data.message);
            socket.emit('messageSent', { platform: 'instagram', success: true });
        } catch (error) {
            socket.emit('messageSent', { platform: 'instagram', success: false, error: error.message });
        }
    });

    // WhatsApp message sending
    socket.on('whatsapp:sendMessage', async (data) => {
        try {
            const formattedNumber = data.number.includes('@c.us') ? data.number : `${data.number}@c.us`;
            await waClient.sendMessage(formattedNumber, data.message);
            socket.emit('messageSent', { platform: 'whatsapp', success: true });
        } catch (error) {
            socket.emit('messageSent', { platform: 'whatsapp', success: false, error: error.message });
        }
    });

    // Fetch recent chats (combine Instagram and WhatsApp)
    socket.on('getRecentChats', async () => {
        try {
            const igInbox = await igClient.feed.directInbox().items();
            const igChats = igInbox.map(thread => ({
                id: thread.thread_id,
                platform: 'instagram',
                users: thread.users.map(user => user.username),
                lastMessage: thread.last_permanent_item.text,
                timestamp: thread.last_permanent_item.timestamp
            }));

            // For WhatsApp, you'd need to implement a method to get recent chats
            // This is a placeholder as WhatsApp Web API doesn't provide this directly
            const waChats = []; // Implement WhatsApp recent chats fetching

            const allChats = [...igChats, ...waChats].sort((a, b) => b.timestamp - a.timestamp);
            socket.emit('recentChats', allChats);
        } catch (error) {
            socket.emit('error', { message: 'Failed to fetch recent chats' });
        }
    });

    // Fetch chat history
    socket.on('getChatHistory', async (data) => {
        try {
            if (data.platform === 'instagram') {
                const thread = igClient.entity.directThread([data.chatId]);
                const messages = await thread.items();
                socket.emit('chatHistory', { platform: 'instagram', messages });
            } else if (data.platform === 'whatsapp') {
                // Implement WhatsApp chat history fetching
                // This will depend on how you store/retrieve WhatsApp messages
            }
        } catch (error) {
            socket.emit('error', { message: 'Failed to fetch chat history' });
        }
    });
});

waClient.on('qr', async (qr) => {
    waLatestQR = await qrcode.toDataURL(qr);
    io.emit('whatsapp:qr', waLatestQR);
});

waClient.on('ready', () => {
    console.log('WhatsApp Client is ready!');
    io.emit('whatsapp:ready', 'WhatsApp is ready!');
});

waClient.on('message_create', (message) => {
    if (message.fromMe) return;
    io.emit('messageReceived', {
        platform: 'whatsapp',
        from: message.from,
        body: message.body
    });
});

waClient.initialize();

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;