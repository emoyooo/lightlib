import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: () => {
        const authStore = useAuthStore()
        // Если авторизован → home, иначе → login
        return authStore.isAuthenticated ? '/home' : '/login'
      },
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/SearchView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/library',
      name: 'library',
      component: () => import('../views/LibraryView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      // 🔗 Детали книги
      path: '/book/:id',
      name: 'book-details',
      component: () => import('../views/BookDetailsView.vue'),
      meta: { requiresAuth: true },
      props: true, // 👉 теперь id попадёт в props компонента
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { guest: true },
    },
    {
  path: '/reading/:id',
  name: 'reading',
  component: () => import('../views/ReadingView.vue'),
  meta: { requiresAuth: true },
},
    {
      path: '/:catchAll(.*)',
      redirect: () => {
        const authStore = useAuthStore()
        return authStore.isAuthenticated ? '/home' : '/login'
      },
    },
  ],
})

// 🔐 Навигационный guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Страница требует авторизации, а пользователь не авторизован
    next('/login')
  } else if (to.meta.guest && authStore.isAuthenticated) {
    // Страница для гостей, а пользователь авторизован
    next('/home')
  } else {
    next()
  }
})

export default router
