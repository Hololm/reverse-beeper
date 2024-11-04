<template>
  <div class="chat-container">
    <!-- Chat List Sidebar -->
    <div class="chat-list">
      <div class="chat-list-header">
        <h2>Conversations</h2>
        <button @click="refreshChats">Refresh</button>
      </div>

      <div class="chat-items">
        <div
          v-for="chat in allChats"
          :key="chat.id"
          @click="selectChat(chat)"
          :class="['chat-item', { active: selectedChat?.id === chat.id }]"
        >
          <div class="chat-item-header">
            <span class="platform-badge" :class="chat.platform">
              {{ chat.platform }}
            </span>
            <span class="username">{{ chat.users.join(', ') }}</span>
          </div>
          <div class="last-message">{{ chat.lastMessage }}</div>
        </div>
      </div>
    </div>

    <!-- Chat Window -->
    <div class="chat-window" v-if="selectedChat">
      <div class="chat-header">
        <h3>{{ selectedChat.users.join(', ') }}</h3>
        <span class="platform-badge" :class="selectedChat.platform">
          {{ selectedChat.platform }}
        </span>
      </div>

      <div class="messages" ref="messageContainer">
        <div
            v-for="(message, index) in chatHistory"
            :key="index"
            :class="['message', message.fromMe ? 'sent' : 'received']"
        >
          <div class="message-content">{{ message.text }}</div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>
      </div>

      <div class="message-input">
        <input
            v-model="newMessage"
            @keyup.enter="sendMessage"
            placeholder="Type a message..."
        />
        <button @click="sendMessage">Send</button>
      </div>
    </div>

    <div class="no-chat-selected" v-else>
      Select a conversation to start messaging
    </div>
  </div>
</template>

<script>
import {io} from 'socket.io-client';

export default {
  name: 'ChatPage',
  data() {
    return {
      socket: null,
      allChats: [],
      selectedChat: null,
      chatHistory: [],
      newMessage: '',
    }
  },
  created() {
    this.socket = io('http://localhost:3000');
    this.setupSocketListeners();
    this.loadChats();
  },
  methods: {
    setupSocketListeners() {
      this.socket.on('chats', (chats) => {
        this.allChats = chats;
      });

      this.socket.on('chatHistory', (history) => {
        this.chatHistory = history;
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      });

      this.socket.on('messageReceived', (message) => {
        if (this.selectedChat?.id === message.chatId) {
          this.chatHistory.push(message);
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        }
        this.loadChats(); // Refresh chat list to update last messages
      });
    },
    loadChats() {
      this.socket.emit('getChats');
    },
    selectChat(chat) {
      this.selectedChat = chat;
      this.socket.emit('getChatHistory', {
        platform: chat.platform,
        chatId: chat.id
      });
    },
    sendMessage() {
      if (!this.newMessage.trim()) return;

      const messageData = {
        platform: this.selectedChat.platform,
        chatId: this.selectedChat.id,
        message: this.newMessage
      };

      this.socket.emit('sendMessage', messageData);
      this.newMessage = '';
    },
    scrollToBottom() {
      const container = this.$refs.messageContainer;
      container.scrollTop = container.scrollHeight;
    },
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString();
    }
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  height: calc(100vh - 100px);
  margin: 20px;
  gap: 20px;
}

.chat-list {
  width: 300px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.chat-list-header {
  padding: 15px;
  border-bottom: 1px solid #ddd;
  background: #f8f9fa;
}

.chat-items {
  overflow-y: auto;
  height: calc(100% - 60px);
}

.chat-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.chat-item:hover {
  background: #f8f9fa;
}

.chat-item.active {
  background: #e9ecef;
}

.chat-window {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message {
  margin: 10px 0;
  max-width: 70%;
}

.message.sent {
  margin-left: auto;
  text-align: right;
}

.message-content {
  padding: 10px;
  border-radius: 8px;
  background: #f0f0f0;
  display: inline-block;
}

.message.sent .message-content {
  background: #42b983;
  color: white;
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

.platform-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.platform-badge.instagram {
  background: #e1306c;
  color: white;
}

.platform-badge.whatsapp {
  background: #25D366;
  color: white;
}

.no-chat-selected {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 1.2em;
}
</style>
