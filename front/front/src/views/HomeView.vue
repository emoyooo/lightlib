<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="home-container">
    <header class="header">
      <div class="header-content">
        <div class="logo-section">
          <img src="@/assets/lightliblogo.png" alt="LightLib" class="logo" />
          <h1 class="brand">LightLib</h1>
        </div>

        <nav class="nav">
          <div class="user-section">
            <span class="user-email">{{ authStore.user?.email }}</span>
            <button @click="handleLogout" class="btn-logout">Logout</button>
          </div>
        </nav>
      </div>
    </header>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  margin: 0;
  padding: 0;
}

.header {
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo {
  width: 40px;
  height: 40px;
}

.brand {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.nav {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

.nav-link:hover {
  color: #667eea;
  background-color: #f8fafc;
}

.nav-link.router-link-active {
  color: #667eea;
  background-color: #ede9fe;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-left: 2rem;
  border-left: 2px solid #e2e8f0;
}

.user-email {
  color: #475569;
  font-size: 0.9rem;
  font-weight: 500;
}

.btn-logout {
  padding: 0.5rem 1.25rem;
  background: #2c3e50;
  color: #ffffff;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  font-family: inherit;
}

.btn-logout:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.welcome-section {
  text-align: center;
  margin-bottom: 3rem;
}

.welcome-section h2 {
  font-size: 2.5rem;
  color: #1a202c;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.welcome-section p {
  font-size: 1.1rem;
  color: #64748b;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  color: #1a202c;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.feature-card p {
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }

  .nav {
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
  }

  .user-section {
    padding-left: 0;
    border-left: none;
    padding-top: 1rem;
    border-top: 2px solid #e2e8f0;
    width: 100%;
    justify-content: center;
  }

  .welcome-section h2 {
    font-size: 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
