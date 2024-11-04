import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import ChatPage from '@/views/ChatPage.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/chat', component: ChatPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router