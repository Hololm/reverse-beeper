const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { IgApiClient } = require('instagram-private-api');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(express.static('public'));

let ig = null;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        ig = new IgApiClient();
        ig.state.generateDevice(username);
        await ig.simulate.preLoginFlow();
        const loggedInUser = await ig.account.login(username, password);

        try {
            await ig.simulate.postLoginFlow();
        } catch (postLoginError) {
            console.warn('Post-login simulation failed:', postLoginError.message);
        }

        res.json({ success: true, user: loggedInUser.username });
    } catch (error) {
        console.error('Login failed:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('sendMessage', async (data) => {
        if (!ig) {
            socket.emit('messageSent', { success: false, message: 'Not logged in' });
            return;
        }

        const { userId, message } = data;
        try {
            const thread = ig.entity.directThread([userId.toString()]);
            await thread.broadcastText(message);
            socket.emit('messageSent', { success: true, message: 'Message sent successfully' });
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('messageSent', { success: false, message: 'Failed to send message: ' + error.message });
        }
    });

    socket.on('getConversations', async () => {
        if (!ig) {
            socket.emit('conversationsReceived', { success: false, message: 'Not logged in' });
            return;
        }

        try {
            const inbox = await ig.feed.directInbox().items();
            const conversations = inbox.map(thread => ({
                id: thread.thread_id,
                users: thread.users.map(user => user.username),
                lastMessage: thread.last_permanent_item.text
            }));
            socket.emit('conversationsReceived', { success: true, conversations });
        } catch (error) {
            console.error('Error fetching conversations:', error);
            socket.emit('conversationsReceived', { success: false, message: 'Failed to fetch conversations: ' + error.message });
        }
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});