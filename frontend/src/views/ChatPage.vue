<template>
  <div class="chat-container">
    <!-- Chat List -->
    <div class="chat-list">
      <div class="chat-list-header">
        <h2>Conversations</h2>
        <button @click="getRecentChats" :disabled="isLoading">
          {{ isLoading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
      <div v-if="recentChats.length === 0" class="no-chats">
        No conversations found
      </div>
      <div v-else class="chat-items">
        <div
          v-for="chat in recentChats"
          :key="chat.id"
          @click="selectChat(chat)"
          :class="['chat-item', { active: selectedChat?.id === chat.id }]"
        >
          <div class="chat-item-header">
            <span :class="['platform-badge', chat.platform]">
              {{ chat.platform }}
            </span>
            <span class="username">{{ chat.users.join(', ') }}</span>
          </div>
          <div class="last-message">{{ chat.lastMessage }}</div>
        </div>
      </div>
    </div>

    <!-- Chat Window -->
    <div v-if="selectedChat" class="chat-window">
      <div class="chat-header">
        <div class="chat-header-info">
          <span :class="['platform-badge', selectedChat.platform]">
            {{ selectedChat.platform }}
          </span>
          <h3>{{ selectedChat.users.join(', ') }}</h3>
        </div>
      </div>
      <div class="messages" ref="messagesContainer">
        <div v-if="chatHistory.length === 0" class="no-messages">
          No messages yet
        </div>
        <div
          v-for="message in chatHistory"
          :key="message.id"
          :class="['message', { sent: message.fromMe }]"
        >
          <div class="message-header">
            <img
              :src="message.avatar || 'https://ia601308.us.archive.org/8/items/whatsapp-smiling-guy-i-accidentally-made/whatsapp%20generic%20person%20light.jpg'"
              class="avatar"
              alt="Profile picture"
            />
            <span class="sender-name">{{ message.senderName }}</span>
          </div>
          <div class="message-content">{{ message.text }}</div>
          <div class="message-time">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>
      </div>
      <div class="message-input">
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          placeholder="Type a message..."
          :disabled="!selectedChat"
        />
        <button
          @click="sendMessage"
          :disabled="!newMessage.trim() || !selectedChat"
        >
          Send
        </button>
      </div>
    </div>
    <div v-else class="no-chat-selected">
      Select a conversation to start messaging
    </div>
  </div>
</template>

<script>
import { io } from 'socket.io-client';

export default {
  name: 'ChatPage',
  data() {
    return {
      socket: null,
      recentChats: [],
      selectedChat: null,
      chatHistory: [],
      newMessage: '',
      isLoading: false,
      error: null
    }
  },
  created() {
    const whatsappLoggedIn = localStorage.getItem('whatsappLoggedIn');
    if (!whatsappLoggedIn) {
      this.$router.push('/');
    }
  },
  mounted() {
    this.initializeSocket();
  },
  methods: {
    initializeSocket() {
      this.socket = io('http://localhost:3000', {
        reconnection: true,
        reconnectionAttempts: 5
      });
      this.setupSocketListeners();
      this.getRecentChats();
    },
    setupSocketListeners() {
      this.socket.on('connect', () => {
        console.log('Socket connected');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.error = 'Connection error. Please refresh the page.';
      });

      this.socket.on('recentChats', (chats) => {
        this.recentChats = chats;
        this.isLoading = false;
      });

      this.socket.on('chatHistory', (data) => {
        this.chatHistory = data.messages;
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      });

      this.socket.on('messageSent', (result) => {
        if (result.success) {
          this.chatHistory.push({
            id: Date.now(),
            text: this.newMessage,
            fromMe: true,
            timestamp: Date.now()
          });
          this.newMessage = '';
          this.scrollToBottom();
          this.getRecentChats();
        } else {
          console.error('Message send error:', result.error);
          alert('Failed to send message: ' + result.error);
        }
      });

      this.socket.on('messageReceived', (message) => {
        if (
          this.selectedChat &&
          this.selectedChat.platform === message.platform &&
          this.selectedChat.id === message.from
        ) {
          this.chatHistory.push({
            id: Date.now(),
            text: message.body,
            fromMe: false,
            timestamp: message.timestamp || Date.now(),
            senderName: message.senderName,
            avatar: message.avatar
          });
          this.scrollToBottom();
        }
        this.getRecentChats();
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
        this.error = error.message;
      });
    },
    getRecentChats() {
      this.isLoading = true;
      this.socket.emit('getRecentChats');
    },
    selectChat(chat) {
      this.selectedChat = chat;
      this.chatHistory = [];
      this.error = null;
      this.getChatHistory(chat);
    },
    getChatHistory(chat) {
      this.socket.emit('getChatHistory', {
        platform: chat.platform,
        chatId: chat.id
      });
    },
    sendMessage() {
      if (!this.newMessage.trim() || !this.selectedChat) return;
      this.socket.emit('whatsapp:sendMessage', {
        userId: this.selectedChat.id,
        message: this.newMessage
      });
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString();
    }
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  height: calc(100vh - 80px);
  margin: 20px;
  gap: 20px;
}

.chat-list {
  width: 300px;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.chat-list-header {
  padding: 15px;
  border-bottom: 1px solid #ddd;
  background-color: #f8f9fa;
}

.chat-items {
  overflow-y: auto;
  flex: 1;
}

.chat-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.chat-item:hover {
  background-color: #f5f5f5;
}

.chat-item.active {
  background-color: #e3f2fd;
}

.platform-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.platform-badge.whatsapp {
  background-color: #25D366;
  color: white;
}

.chat-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.username {
  font-weight: bold;
}

.last-message {
  font-size: 0.9em;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-window {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 15px;
  border-bottom: 1px solid #ddd;
  background-color: #f8f9fa;
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message {
  max-width: 70%;
  padding: 10px;
  border-radius: 8px;
  background-color: #f0f0f0;
  align-self: flex-start;
}

.message.sent {
  background-color: #e3f2fd;
  align-self: flex-end;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}

.sender-name {
  font-size: 0.9em;
  font-weight: bold;
  color: #555;
}

.message-content {
  margin-bottom: 4px;
  word-break: break-word;
}

.message-time {
  font-size: 0.8em;
  color: #666;
}

.message-input {
  padding: 15px;
  border-top: 1px solid #ddd;
  display: flex;
  gap: 10px;
}

.message-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.message-input button {
  padding: 8px 16px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.message-input button:hover:not(:disabled) {
  background-color: #1565c0;
}

.message-input button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.no-chat-selected {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 1.2em;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.no-chats,
.no-messages {
  padding: 20px;
  text-align: center;
  color: #666;
}

.error {
  color: #dc3545;
  padding: 10px;
  text-align: center;
  background-color: #f8d7da;
  border-radius: 4px;
  margin: 10px;
}
</style>