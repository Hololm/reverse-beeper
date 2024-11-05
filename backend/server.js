const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const { IgApiClient } = require('instagram-private-api');
const { Client } = require('whatsapp-web.js');
const session = require('express-session');
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

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Modify Instagram login endpoint
app.post('/login/instagram', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            error: 'Username and password are required'
        });
    }

    try {
        igClient.state.generateDevice(username);
        await igClient.simulate.preLoginFlow();
        const loggedInUser = await igClient.account.login(username, password);

        // Test the connection by fetching inbox immediately
        try {
            const inbox = await igClient.feed.directInbox().items();
            console.log('Successfully fetched inbox:', inbox.length, 'conversations');
        } catch (inboxError) {
            console.error('Failed to fetch inbox:', inboxError);
        }

        res.json({ success: true, user: loggedInUser.username });
        console.log('Logged into Instagram!');
    } catch (error) {
        console.error('Instagram login error:', error);
        const errorMessage = error.response?.body?.message || error.message;
        res.status(400).json({
            success: false,
            error: errorMessage
        });
    }
});

app.get('/auth/status', (req, res) => {
    res.json({
        instagram: !!req.session.instagramUser,
        whatsapp: !!waClient.info
    });
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
            socket.emit('messageSent', {
                platform: 'instagram',
                success: true,
                message: 'Message sent successfully'
            });
        } catch (error) {
            console.error('Error sending Instagram message:', error);
            socket.emit('messageSent', {
                platform: 'instagram',
                success: false,
                error: error.message
            });
        }
    });

    // WhatsApp message sending
    socket.on('whatsapp:sendMessage', async (data) => {
        try {
            const formattedNumber = data.userId.includes('@c.us') ? data.userId : `${data.userId}@c.us`;
            await waClient.sendMessage(formattedNumber, data.message);
            socket.emit('messageSent', {
                platform: 'whatsapp',
                success: true,
                message: 'Message sent successfully'
            });
        } catch (error) {
            console.error('Error sending WhatsApp message:', error);
            socket.emit('messageSent', {
                platform: 'whatsapp',
                success: false,
                error: error.message
            });
        }
    });

    // Fetch recent chats (combine Instagram and WhatsApp)
    socket.on('getRecentChats', async () => {
        try {
            let allChats = [];

            // Fetch Instagram chats
            if (igClient) {
                try {
                    const igFeed = igClient.feed.directInbox();
                    const igInbox = await igFeed.items();
                    console.log('Instagram chats fetched:', igInbox.length);

                    const igChats = igInbox.map(thread => ({
                        id: thread.thread_id,
                        platform: 'instagram',
                        users: thread.users.map(user => user.username),
                        lastMessage: thread.last_permanent_item?.text || 'No message',
                        timestamp: thread.last_permanent_item?.timestamp || Date.now()
                    }));
                    allChats = [...allChats, ...igChats];
                } catch (igError) {
                    console.error('Error fetching Instagram chats:', igError);
                }
            }

            // Fetch WhatsApp chats
            if (waClient.info) {
                try {
                    const waChats = await waClient.getChats();
                    console.log('WhatsApp chats fetched:', waChats.length);

                    const formattedWaChats = waChats.map(chat => ({
                        id: chat.id._serialized,
                        platform: 'whatsapp',
                        users: [chat.name || chat.id.user],
                        lastMessage: chat.lastMessage?.body || 'No message',
                        timestamp: chat.lastMessage?.timestamp || Date.now()
                    }));
                    allChats = [...allChats, ...formattedWaChats];
                } catch (waError) {
                    console.error('Error fetching WhatsApp chats:', waError);
                }
            }

            // Sort all chats by timestamp
            allChats.sort((a, b) => b.timestamp - a.timestamp);
            console.log('Total chats being sent:', allChats.length);

            socket.emit('recentChats', allChats);
        } catch (error) {
            console.error('Error in getRecentChats:', error);
            socket.emit('error', { message: 'Failed to fetch recent chats' });
        }
    });

    // Fetch chat history
// Fetch chat history
socket.on('getChatHistory', async (data) => {
    try {
        if (data.platform === 'instagram') {
            // Create a thread feed instead of using thread directly
            const threadFeed = igClient.feed.directThread({ thread_id: data.chatId });
            const items = await threadFeed.items();

            const formattedMessages = items.map(msg => ({
                id: msg.item_id,
                text: msg.text || 'Media message',
                timestamp: msg.timestamp,
                fromMe: msg.user_id === igClient.state.cookieUserId
            }));

            socket.emit('chatHistory', {
                platform: 'instagram',
                messages: formattedMessages
            });
        } else if (data.platform === 'whatsapp') {
            const chat = await waClient.getChatById(data.chatId);
            const messages = await chat.fetchMessages();
            const formattedMessages = messages.map(msg => ({
                id: msg.id.id,
                text: msg.body,
                timestamp: msg.timestamp * 1000,
                fromMe: msg.fromMe
            }));
            socket.emit('chatHistory', {
                platform: 'whatsapp',
                messages: formattedMessages
            });
        }
    } catch (error) {
        console.error('Error fetching chat history:', error);
        socket.emit('error', { message: 'Failed to fetch chat history' });
        }
    });
});

// WhatsApp event handlers
waClient.on('qr', async (qr) => {
    try {
        waLatestQR = await qrcode.toDataURL(qr);
        io.emit('whatsapp:qr', waLatestQR);
    } catch (error) {
        console.error('Error generating QR code:', error);
    }
});

waClient.on('ready', () => {
    console.log('WhatsApp Client is ready!');
    io.emit('whatsapp:ready', 'WhatsApp is ready!');
});

waClient.on('message', (message) => {
    if (message.fromMe) return;
    io.emit('messageReceived', {
        platform: 'whatsapp',
        from: message.from,
        body: message.body,
        timestamp: message.timestamp * 1000
    });
});

waClient.initialize();

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;