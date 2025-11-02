<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()

// Имя пользователя
const userName = computed(() => authStore.user?.nickname || 'User')

// Данные
const featuredBooks = ref([])
const stats = ref({
  readingNow: 3,
  inPlans: 12,
  finished: 47,
  favorites: 8
})

const continueReading = ref({
  id: 101,
  title: 'The Midnight Library',
  author: 'Matt Haig',
  progress: 68,
  chapter: 12
})

// --- Загружаем данные (если API доступно) ---
onMounted(async () => {
  try {
    // Пример реального запроса, можно закомментировать если нет API
    // const [featuredRes, statsRes, readingRes] = await Promise.all([
    //   axios.get('http://localhost:3000/api/books/featured'),
    //   axios.get('http://localhost:3000/api/user/library/stats'),
    //   axios.get('http://localhost:3000/api/user/continue')
    // ])
    // featuredBooks.value = featuredRes.data
    // stats.value = statsRes.data
    // continueReading.value = readingRes.data

    // --- Заглушки, чтобы страница не была пустой ---
    featuredBooks.value = [
      { id: 1, title: 'Dune', author: 'Frank Herbert' },
      { id: 2, title: '1984', author: 'George Orwell' },
      { id: 3, title: 'Pride and Prejudice', author: 'Jane Austen' }
    ]
  } catch (err) {
    console.error('Ошибка загрузки данных:', err)
  }
})

// --- Навигация ---
const goToReading = () => {
  if (continueReading.value?.id) {
    router.push(`/reading/${continueReading.value.id}`)
  }
}

const goToLibrary = (filter) => {
  router.push({ path: '/library', query: { filter } })
}
</script>

<template>
  <div class="home-container">
    <!-- Header -->
    <header class="home-header">
      <div>
        <h1>Hello, {{ userName }}!</h1>
        <p>Ready to continue your reading journey?</p>
      </div>
      <button class="discover-btn">Discover Books</button>
    </header>

    <!-- Featured Books -->
    <section class="featured">
      <h2>Featured This Week</h2>
      <div class="book-list">
        <div
          v-for="book in featuredBooks"
          :key="book.id"
          class="book-card"
        >
          <div>
            <strong>{{ book.title }}</strong>
            <p class="author">{{ book.author }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Library Stats -->
    <section class="library-section">
      <h2>Your Library</h2>
      <div class="library-stats">
        <div class="stat-card blue" @click="goToLibrary('reading')">
          <span>📘</span>
          <p>Reading Now</p>
          <h3>{{ stats.readingNow }}</h3>
          <small>books</small>
        </div>
        <div class="stat-card yellow" @click="goToLibrary('plans')">
          <span>⏰</span>
          <p>In Plans</p>
          <h3>{{ stats.inPlans }}</h3>
          <small>books</small>
        </div>
        <div class="stat-card green" @click="goToLibrary('finished')">
          <span>⭐</span>
          <p>Finished</p>
          <h3>{{ stats.finished }}</h3>
          <small>books</small>
        </div>
        <div class="stat-card pink" @click="goToLibrary('favorites')">
          <span>❤️</span>
          <p>Favorites</p>
          <h3>{{ stats.favorites }}</h3>
          <small>books</small>
        </div>
      </div>
    </section>

    <!-- Continue Reading -->
    <section class="continue-reading">
      <h2>Continue Reading</h2>
      <div class="reading-card" @click="goToReading">
        <p class="book-title">{{ continueReading.title }}</p>
        <p class="book-author">{{ continueReading.author }}</p>
        <p class="progress">{{ continueReading.progress }}% complete — Chapter {{ continueReading.chapter }}</p>

        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: continueReading.progress + '%' }"
          ></div>
        </div>

        <button class="continue-btn">Continue Reading</button>
      </div>
    </section>

    <!-- Bottom Navigation -->
    <footer class="footer">
      <button @click="router.push('/home')" class="active">🏠 Home</button>
      <button @click="router.push('/search')">🔍 Search</button>
      <button @click="router.push('/library')">📚 Library</button>
      <button @click="router.push('/profile')">👤 Profile</button>
    </footer>
  </div>
</template>

<style scoped>
.home-container {
  padding: 2rem 4rem;
  font-family: 'Inter', sans-serif;
  background-color: #fff;
  color: #222;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Header */
.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
}

.home-header h1 {
  font-size: 1.8rem;
  margin-bottom: 0.3rem;
}

.home-header p {
  color: #555;
}

.discover-btn {
  background-color: #0d1b67;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: 0.3s;
}

.discover-btn:hover {
  background-color: #142a9c;
}

/* Featured */
.featured {
  margin-bottom: 3rem;
}

.featured h2 {
  font-size: 1.3rem;
}

.book-list {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
}

.book-card {
  background: #f9fafb;
  border-radius: 12px;
  width: 160px;
  height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.book-card:hover {
  transform: scale(1.03);
}

.author {
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.3rem;
}

/* Library stats */
.library-section {
  margin-bottom: 3rem;
}

.library-section h2 {
  font-size: 1.3rem;
}

.library-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.stat-card {
  flex: 1;
  min-width: 150px;
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-card.blue { background: #eef3ff; }
.stat-card.yellow { background: #fff7e0; }
.stat-card.green { background: #eafbee; }
.stat-card.pink { background: #fdeef2; }

.stat-card span {
  font-size: 1.8rem;
}

/* Continue Reading */
.continue-reading {
  margin-bottom: 3rem;
}

.reading-card {
  background: #f3f6ff;
  padding: 1.5rem;
  border-radius: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.reading-card:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.progress-bar {
  width: 100%;
  background: #ddd;
  height: 6px;
  border-radius: 6px;
  margin: 0.5rem 0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #0d1b67;
}

.continue-btn {
  background-color: #0d1b67;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  cursor: pointer;
  margin-top: 0.5rem;
}

.continue-btn:hover {
  background-color: #142a9c;
}

/* Footer */
.footer {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #e5e7eb;
  padding: 1rem 0;
}

.footer button {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #444;
}

.footer button.active {
  color: #0d1b67;
  font-weight: 600;
}
</style>

