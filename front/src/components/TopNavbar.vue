<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const searchQuery = ref('')

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ name: 'search', query: { q: searchQuery.value } })
  }
}

const isActive = (routeName) => {
  return route.name === routeName
}
</script>

<template>
  <nav class="top-navbar">
    <div class="navbar-content">
      <!-- Logo -->
      <div
        class="logo"
        @click="router.push('/')"
        style="align-items: flex-end; display: flex; color: rgb(9 61 108); column-gap: 10px"
      >
        <img src="../assets/lightliblogo.png" alt="" style="width: 10%" />
        LightLib
      </div>

      <!-- Navigation Links -->
      <div class="nav-links">
        <button @click="router.push('/')" :class="['nav-link', { active: isActive('home') }]">
          <font-awesome-icon :icon="['fas', 'house']" class="nav-icon" />
          <span>Home</span>
        </button>

        <button
          @click="router.push('/search')"
          :class="['nav-link', { active: isActive('search') }]"
        >
          <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="nav-icon" />
          <span>Search</span>
        </button>

        <button
          v-if="authStore.isAuthenticated"
          @click="router.push('/library')"
          :class="['nav-link', { active: isActive('library') }]"
        >
          <font-awesome-icon :icon="['fas', 'book']" class="nav-icon" />
          <span>Library</span>
        </button>

        <button
          v-if="authStore.isAuthenticated"
          @click="router.push('/profile')"
          :class="['nav-link', { active: isActive('profile') }]"
        >
          <font-awesome-icon :icon="['fas', 'user']" class="nav-icon" />
          <span>Profile</span>
        </button>

        <button v-else @click="router.push('/login')" class="nav-link">
          <font-awesome-icon :icon="['fas', 'user']" class="nav-icon" />
          <span>Login</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.top-navbar {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.navbar-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 2rem;
  justify-content: space-between;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon {
  color: #04103c;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: none;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  color: #666;
  transition: all 0.2s;
  white-space: nowrap;
}

.nav-link:hover {
  background: #f5f5f5;
  color: #1a1a1a;
}

.nav-link.active {
  color: #04103c;
  font-weight: bold;
}
.nav-link.active span {
  font-weight: bold;
}

.nav-icon {
  font-size: 1.2rem;
}

@media (max-width: 968px) {
  .navbar-content {
    gap: 1rem;
  }

  .nav-link span:not(.nav-icon) {
    display: none;
  }

  .nav-link {
    padding: 0.75rem;
  }
}

@media (max-width: 768px) {
  .top-navbar {
    padding: 1rem;
  }

  .search-container {
    max-width: 300px;
  }

  .logo {
    font-size: 1.2rem;
  }
}
</style>
