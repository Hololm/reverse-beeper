<template>
  <div class="home">
    <h1>Unified Messaging</h1>
    <div class="login-options">
      <!-- Instagram Login -->
      <div class="login-section">
        <h2>Instagram Login</h2>
        <div v-if="!isInstagramLoggedIn">
          <input v-model="instagramUsername" placeholder="Username" />
          <input v-model="instagramPassword" type="password" placeholder="Password" />
          <button @click="loginInstagram" :disabled="isLoading">
            {{ isLoading ? 'Logging in...' : 'Login to Instagram' }}
          </button>
        </div>
        <div v-else class="success-message">
          Logged in to Instagram ✓
        </div>
      </div>

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
      v-if="isInstagramLoggedIn || isWhatsAppLoggedIn"
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
      instagramUsername: '',
      instagramPassword: '',
      whatsappQR: null,
      isLoading: false,
      errorMessage: '',
      isInstagramLoggedIn: false,
      isWhatsAppLoggedIn: false
    }
  },
  created() {
  // Clear existing auth state when landing on home page
  localStorage.removeItem('instagramUser');
  localStorage.removeItem('whatsappLoggedIn');
  this.isInstagramLoggedIn = false;
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
    async loginInstagram() {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const response = await axios.post('http://localhost:3000/login/instagram', {
          username: this.instagramUsername,
          password: this.instagramPassword
        });

        if (response.data.success) {
          this.isInstagramLoggedIn = true;
          localStorage.setItem('instagramUser', response.data.user);
          // Don't automatically redirect - let user click "Enter Chat"
        } else {
          this.errorMessage = response.data.error || 'Login failed';
        }
      } catch (error) {
        console.error('Login error:', error);
        this.errorMessage = error.response?.data?.error || 'Login failed';
      } finally {
        this.isLoading = false;
      }
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
  if (this.isInstagramLoggedIn || this.isWhatsAppLoggedIn) {
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

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.login-options {
  display: flex;
  gap: 40px;
  justify-content: center;
  margin-top: 30px;
}

.login-section {
  flex: 1;
  max-width: 300px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

input {
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #a8d5c2;
}

.qr-container {
  text-align: center;
}

.qr-container img {
  max-width: 200px;
  margin: 10px 0;
}

.error-message {
  color: red;
  margin-top: 20px;
}

.success-message {
  color: #42b983;
  font-weight: bold;
  text-align: center;
  margin-top: 10px;
}

.enter-chat-btn {
  margin-top: 30px;
  background-color: #2c3e50;
}

button:hover {
  opacity: 0.9;
}

button:disabled {
  cursor: not-allowed;
}
</style>
