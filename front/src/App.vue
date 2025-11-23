<script setup>
import { RouterView, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { computed } from 'vue'
import TopNavbar from './components/TopNavbar.vue'

const route = useRoute()
const authStore = useAuthStore()

// Hide navigation on certain pages
const hideNavigation = computed(() => {
  return ['login', 'register', 'reading', 'profile'].includes(route.name)
})
</script>

<template>
  <div id="app">
    <TopNavbar />
    <RouterView />
  </div>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  padding-bottom: 70px; /* Space for bottom nav */
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  text-decoration: none;
  color: var(--color-text, #666);
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  min-width: 70px;
}

.nav-item:hover {
  color: #04103c;
  background: hsla(160, 100%, 37%, 0.1);
}

.nav-item.router-link-active {
  color: #04103c;
  font-weight: 600;
}

.nav-icon {
  font-size: 1.5rem;
}

.nav-label {
  font-size: 0.75rem;
  font-weight: 500;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #1a1a1a;
    --color-background-soft: #222222;
    --color-background-mute: #282828;
    --color-border: #383838;
    --color-text: #e0e0e0;
    --color-heading: #ffffff;
  }

  .bottom-nav {
    background: var(--color-background);
    border-top-color: var(--color-border);
  }
}

/* Hide bottom nav on desktop (optional) */
@media (min-width: 768px) {
  .bottom-nav {
    display: none; /* Remove this line if you want nav on desktop too */
  }

  #app {
    padding-bottom: 0;
  }
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .nav-label {
    font-size: 0.7rem;
  }

  .nav-icon {
    font-size: 1.3rem;
  }

  .nav-item {
    padding: 0.4rem 0.6rem;
    min-width: 60px;
  }
}
</style>
