import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/resume',
      name: 'resume',
      component: () => import('../views/ResumeView.vue'),
    },
    {
      path: '/donate',
      name: 'donate',
      component: () => import('../views/DonateView.vue'),
    },
    {
      path: '/tarkov',
      name: 'tarkov',
      component: () => import('../views/TarkovView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/404',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
    {
      path: '/500',
      name: 'error',
      component: () => import('../views/ErrorView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404',
    },
  ],
})

export default router
