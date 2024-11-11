// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const session = require('express-session');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const waClient = new Client();
let waLatestQR = null;

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Only WhatsApp endpoints remain
app.get('/login/whatsapp', (req, res) => {
  if (waLatestQR) {
    res.json({ qr: waLatestQR });
  } else {
    res.status(404).json({ error: 'QR code not yet generated' });
  }
});

app.get('/auth/status', (req, res) => {
  res.json({
    whatsapp: !!waClient.info
  });
});

io.on('connection', (socket) => {
  console.log('A user connected');

  // WhatsApp message sending
  socket.on('whatsapp:sendMessage', async (data) => {
  try {
    let formattedNumber;

    // Check if it's a group chat
    if (data.userId.includes('-')) {
      // Group chat format
      formattedNumber = data.userId.includes('@g.us')
        ? data.userId
        : `${data.userId}@g.us`;
    } else {
      // Individual chat format
      formattedNumber = data.userId.includes('@c.us')
        ? data.userId
        : `${data.userId.replace(/[^0-9]/g, '')}@c.us`;
    }
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

  // Fetch recent chats
  socket.on('getRecentChats', async () => {
    try {
      let allChats = [];
      if (waClient.info) {
        const waChats = await waClient.getChats();
        const formattedWaChats = waChats.map(chat => ({
          id: chat.id._serialized,
          platform: 'whatsapp',
          users: [chat.name || chat.id.user],
          lastMessage: chat.lastMessage?.body || 'No message',
          timestamp: chat.lastMessage?.timestamp || Date.now()
        }));
        allChats = [...allChats, ...formattedWaChats];
      }
      socket.emit('recentChats', allChats);
    } catch (error) {
      console.error('Error in getRecentChats:', error);
      socket.emit('error', { message: 'Failed to fetch recent chats' });
    }
  });

// Fetch chat history
socket.on('getChatHistory', async (data) => {
  try {
    if (data.platform === 'whatsapp') {
      const chat = await waClient.getChatById(data.chatId);
      const messages = await chat.fetchMessages();
      const formattedMessages = await Promise.all(messages.map(async (msg) => {
        const contact = await msg.getContact();
        const profilePicUrl = await contact.getProfilePicUrl();
        return {
          id: msg.id.id,
          text: msg.body,
          timestamp: msg.timestamp * 1000,
          fromMe: msg.fromMe,
          senderName: contact.name || contact.pushname || contact.number,
          avatar: profilePicUrl
        };
      }));
      socket.emit('chatHistory', {
        platform: 'whatsapp',
        messages: formattedMessages
      });
    }
  } catch (error) {
    console.error('Error fetching chat history:', error);
    socket.emit('error', {message: 'Failed to fetch chat history'});
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

    // WhatsApp message receiving
waClient.on('message', async (message) => {
  if (message.fromMe) return;
  const contact = await message.getContact();
  const profilePicUrl = await contact.getProfilePicUrl();

  io.emit('messageReceived', {
    platform: 'whatsapp',
    from: message.from,
    body: message.body,
    timestamp: message.timestamp * 1000,
    senderName: contact.name || contact.pushname || contact.number,
    avatar: profilePicUrl
  });
});

waClient.initialize();

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;