<template>
  <div class="card-container">
    <div class="chat-container">
      <!-- Chat List -->
      <div class="chat-list">
        <div class="chat-list-header">
          <div class="contact-header">
            <button class="story-navigation prev">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>
            <div class="story-container">
            <div class="instagram-story"></div>
            <span class="ig-user">joey.holm_</span>
              </div>
            <div class="story-container">
            <div class="instagram-story"></div>
              <span class="ig-user">danielliao1</span>
              </div>
            <div class="story-container">
            <div class="instagram-story"></div>
              <span class="ig-user">soda.asu</span>
              </div>
            <button class="story-navigation next">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
              </div>
        </div>
        <div v-if="recentChats.length === 0" class="no-chats">
          No conversations found
        </div>
        <div v-else class="chat-items">
            <div v-for="chat in recentChats"
       :key="chat.id"
       @click="selectChat(chat)"
       :class="['chat-item', { active: selectedChat?.id === chat.id }]">
    <div class="avatar-container">
      <img :src="chat.avatar || 'https://ia601308.us.archive.org/8/items/whatsapp-smiling-guy-i-accidentally-made/whatsapp%20generic%20person%20light.jpg'"
           class="avatar"
           alt="Profile picture" />
      <img :src="`https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1022px-WhatsApp.svg.png`"
           class="platform-icon"
           :alt="chat.platform" />
    </div>
    <div class="chat-item-content">
      <div class="chat-item-header">
        <span class="username">{{ chat.users.join(', ') }}</span>
      </div>
      <div class="last-message">{{ chat.lastMessage }}</div>
    </div>
  </div>
        </div>
          <div class="chat-list-footer">
    <div class="footer-icons">
      <div class="left-icons">
        <button class="icon-button" style="margin-left: -8px;">
          <div class="icon-circle">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </div>
        </button>
      </div>
      <div class="right-icons">
        <button class="icon-button">
          <img src="https://ia601308.us.archive.org/8/items/whatsapp-smiling-guy-i-accidentally-made/whatsapp%20generic%20person%20light.jpg"
               class="avatar-icon"
               alt="Profile" />
        </button>
        <button class="icon-button">
          <div class="icon-circle">
            <svg class="settings" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
        </button>
      </div>
    </div>
  </div>
      </div>


      <!-- Chat Window -->
      <div v-if="selectedChat" class="chat-window">
        <div class="chat-header">
    <div class="chat-header-info">
      <div class="user-info">
        <img :src="selectedChat.avatar || 'https://ia601308.us.archive.org/8/items/whatsapp-smiling-guy-i-accidentally-made/whatsapp%20generic%20person%20light.jpg'"
             class="header-avatar"
             alt="Profile picture" />
        <h3>{{ selectedChat.users.join(', ') }}</h3>
      </div>
      <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
    </div>
  </div>
        <div class="messages" ref="messagesContainer">
    <div v-if="chatHistory.length === 0" class="no-messages">
      No messages yet
    </div>
    <div v-for="message in chatHistory"
         :key="message.id"
         :class="['message-container', { sent: message.fromMe }]">
      <!-- Only show avatar for received messages -->
      <div v-if="!message.fromMe" class="message-avatar">
        <img :src="message.avatar || 'https://ia601308.us.archive.org/8/items/whatsapp-smiling-guy-i-accidentally-made/whatsapp%20generic%20person%20light.jpg'"
             class="avatar"
             alt="Profile picture" />
      </div>
      <div class="message">
        <div class="message-content">{{ message.text }}</div>
        <div class="message-time">
          {{ formatTime(message.timestamp) }}
        </div>
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
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
          </button>
        </div>
      </div>
      <div v-else class="no-chat-selected">
        Select a conversation to start messaging
      </div>
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
.chat-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ffffff;
}
.search-input:focus {
  outline: none;
  border-color: #2b5875; /* Maritime blue */
}

.search-icon {
  cursor: pointer;
  transform: translateX(-10px);
  color: white;
}

.message-container {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  max-width: 65%;
}
.message-container.sent {
  margin-left: auto;
  flex-direction: row-reverse;
}

.message-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.message-avatar .avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}

.card-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 0;
  margin: 0;
  overflow: hidden;
    position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  background-color: #e6eef1;
}
.chat-container {
  display: flex;
  max-width: 1396px;
  width: 100%;
  height: calc(100vh - 40px);
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  gap: 0;
}

.chat-list {
  width: 400px;
  background-color: #f8fcfd;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #d1d7db;
  position: relative;
  overflow: hidden;
  font-family: "Gilroy Medium", sans-serif;
  margin-right: 0;
}

.chat-list-header {
  padding: 10px 16px;
  background-color: #1a3847;
  font-family: "Gilroy Bold", sans-serif;
  color: white;
}

.chat-items {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  padding-bottom: 80px; /* Increased padding to prevent overlap with footer */
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.chat-items::-webkit-scrollbar {
  display: none;
}

.chat-item {
  padding: 12px;
  margin-bottom: 8px;
  background-color: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.chat-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.12);
}

.chat-item.active {
  background-color: #f9f9fa; /* Light maritime blue */
}

.contact-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  position: relative;
}

.message {
  padding: 6px 7px 8px 9px;
  border-radius: 7.5px;
background-color: #ffffff;
  box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
  font-family: "Arial", sans-serif;
}

.message-container.sent .message {
  background-color: #E3F0F7; /* Soft lighthouse blue */
}

.avatar-container {
  position: relative;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

/* For chat list avatars */
.chat-item .avatar-container .avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.chat-item .avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.platform-icon {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  background-color: white;
  border-radius: 50%;
  padding: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.chat-item-content {
  flex: 1;
  min-width: 0;
}

.chat-item-header {
  margin-bottom: 4px;
}

.username {
  font-weight: 500;
  color: #1a3847; /* Deep maritime blue */
  font-size: 16px;
}

.last-message {
  color: #5d7a8c; /* Muted navy */
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: "Arial", sans-serif;
}

.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 0;
}

.no-chat-selected {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5d7a8c;
  font-size: 1.2em;
  background-color: #ffffff;
  border: 1px solid #e2e7ea;
  border-radius: 8px;
  margin: 16px;
  font-family: "Gilroy Bold", sans-serif;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.chat-header {
  padding: 14px 24px;
  background-color: #1a3847;
  border-bottom: 1px solid #e2e7ea;
  font-family: "Gilroy Bold", sans-serif;
}

.chat-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background-color: #fbfdff;
  gap: 10px;
  margin: 0;
}

.message {
  max-width: 90%;
  padding: 6px 7px 8px 9px;
  border-radius: 7.5px;
  background-color: white;
  align-self: flex-start;
  box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
}

.message-content {
  margin-bottom: 4px;
  font-size: 14.2px;
  line-height: 19px;
  color: #1a3847;
}

.message-time {
  font-size: 11px;
color: #5d7a8c;
  text-align: right;
}

.message-input {
  padding: 9px 16px;
  background-color: #1a3847;
  display: flex;
  gap: 8px;
  align-items: center;
  height: 62px;
}

.message-input input {
  flex: 1;
  padding: 9px 12px;
  border: 0 solid #e2e7ea;
  background-color: #ffffff;
  border-radius: 8px;
  font-size: 15px;
  font-family: "Gilroy Medium", sans-serif;
}

.message-input input:focus {
  outline: none;
}

.message-input button {
  color: white;
  border-radius: 50%;
  border: none;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #2670d0;
}

.header-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.message-input button:hover:not(:disabled) {
  background-color: #2a7bee; /* Darker maritime blue */
}

.message-input button:disabled {
  background-color: #65a3dc; /* Faded maritime blue */
  cursor: not-allowed;
  font-family: "Gilroy Bold", sans-serif;
}

.no-chats, .no-messages {
  padding: 20px;
  text-align: center;
  color: #666;
}

.chat-items {
  overflow-y: auto;
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.chat-items::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.messages {
  overflow-y: auto;
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.messages::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.chat-list-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #1a3847;
  border-bottom: 1px solid #e2e7ea;
  padding: 12px 0 12px 12px;
  z-index: 2;
}

.footer-icons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px; /* Reduced padding */
}

.left-icons {
  display: flex;
  align-items: center;
  margin-left: -12px;
}

.icon-button {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #5d7a8c;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-button:hover {
  background-color: #e6eef1;
}

.icon-circle {
  background-color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.avatar-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.right-icons {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* Update chat-items to account for footer */
.chat-items {
  padding-bottom: 72px;
}

.instagram-story {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(white, white) padding-box,
              linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888) border-box;
  border: 4px solid transparent;
  transition: all 0.3s ease;
  box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
}

.instagram-story:hover {
  transform: translateY(-1px) scale(1.04);
  box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.ig-user {
  font-size: 14px;
  color: #ffffff;
  text-align: center;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: "Gilroy Bold", sans-serif;
}
.story-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.story-navigation.prev {
  left: 0;
}

.story-navigation.next {
  right: 0;
}

.story-navigation:hover {
  background: white;
  transform: translateY(-50%) scale(1.1);
}

.story-navigation {
  position: absolute;
  top: 45%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #1a3847;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}
</style>