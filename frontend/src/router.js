import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import ChatPage from '@/views/ChatPage.vue'

const routes = [
  {
    path: '/',
    component: HomePage
  },
  {
    path: '/chat',
    component: ChatPage,
    beforeEnter: (to, from, next) => {
      const instagramUser = localStorage.getItem('instagramUser');
      const whatsappLoggedIn = localStorage.getItem('whatsappLoggedIn');

      if (!instagramUser && !whatsappLoggedIn) {
        next('/');
      } else {
        next();
      }
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
