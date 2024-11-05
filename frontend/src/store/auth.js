import { reactive } from 'vue'

export const authStore = reactive({
    instagramUser: null,
    whatsappUser: null,
    setInstagramUser(user) {
        this.instagramUser = user;
        localStorage.setItem('instagramUser', JSON.stringify(user));
    },
    setWhatsappUser(user) {
        this.whatsappUser = user;
        localStorage.setItem('whatsappUser', JSON.stringify(user));
    },
    clearAuth() {
        this.instagramUser = null;
        this.whatsappUser = null;
        localStorage.removeItem('instagramUser');
        localStorage.removeItem('whatsappUser');
    },
    isAuthenticated() {
        return this.instagramUser || this.whatsappUser;
    }
});
