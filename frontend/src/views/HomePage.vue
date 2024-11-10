<template>
  <div class="home">
    <h1>WhatsApp Web Client</h1>
    <div class="login-options">
      <!-- WhatsApp Login -->
      <div class="login-section">
        <h2>WhatsApp Login</h2>
        <div v-if="!isWhatsAppLoggedIn">
          <div v-if="whatsappQR" class="qr-container">
            <img :src="whatsappQR" alt="WhatsApp QR Code" />
            <p>Scan this QR code with WhatsApp</p>
          </div>
          <button @click="initiateWhatsAppLogin" v-else>
            Login to WhatsApp
          </button>
        </div>
        <div v-else class="success-message">
          Logged in to WhatsApp ✓
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <button
      v-if="isWhatsAppLoggedIn"
      @click="goToChat"
      class="enter-chat-btn"
    >
      Enter Chat
    </button>
  </div>
</template>

<script>
import axios from 'axios';
import { io } from 'socket.io-client';

export default {
  name: 'HomePage',
  data() {
    return {
      socket: null,
      whatsappQR: null,
      isLoading: false,
      errorMessage: '',
      isWhatsAppLoggedIn: false
    }
  },
  created() {
    localStorage.removeItem('whatsappLoggedIn');
    this.isWhatsAppLoggedIn = false;
    this.socket = io('http://localhost:3000');
    this.setupSocketListeners();
  },
  methods: {
    setupSocketListeners() {
      this.socket.on('whatsapp:qr', (qr) => {
        this.whatsappQR = qr;
      });

      this.socket.on('whatsapp:ready', () => {
        this.isWhatsAppLoggedIn = true;
        this.whatsappQR = null;
        localStorage.setItem('whatsappLoggedIn', 'true');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.errorMessage = 'Connection error. Please try again.';
      });
    },
    async initiateWhatsAppLogin() {
      try {
        const response = await axios.get('http://localhost:3000/login/whatsapp');
        if (response.data.qr) {
          this.whatsappQR = response.data.qr;
        }
      } catch (error) {
        console.error('WhatsApp QR error:', error);
        this.errorMessage = 'Failed to get WhatsApp QR code';
      }
    },
    goToChat() {
      if (this.isWhatsAppLoggedIn) {
        this.$router.push('/chat').catch(err => {
          if (err.name !== 'NavigationDuplicated') {
            throw err;
          }
        });
      }
    }
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
</script>