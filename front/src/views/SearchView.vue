<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// Кнопка выхода
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// Данные книг (пример, можно потом подключить к API)
const books = ref([
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', genre: 'Classic' },
  { title: 'The Silent Patient', author: 'Alex Michaelides', genre: 'Thriller' },
  { title: 'It Ends with Us', author: 'Colleen Hoover', genre: 'Romance' },
  { title: '1984', author: 'George Orwell', genre: 'Dystopia' },
  { title: 'The Hobbit', author: 'J.R.R. Tolkien', genre: 'Fantasy' },
])

// Фильтры
const query = ref('')
const genre = ref('All')
const genres = ['All', 'Classic', 'Romance', 'Fantasy', 'Thriller', 'Dystopia']

// Отфильтрованные книги
const filteredBooks = computed(() => {
  return books.value.filter((book) => {
    const matchQuery = book.title.toLowerCase().includes(query.value.toLowerCase())
    const matchGenre = genre.value === 'All' || book.genre === genre.value
    return matchQuery && matchGenre
  })
})
</script>

<template>
  <div class="search-page">
    <!-- Header -->
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

    <!-- Main content -->
    <main class="main-content">
      <h2 class="page-title">Search Books</h2>

      <!-- Search bar -->
      <div class="search-bar">
        <input v-model="query" type="text" placeholder="Search by title..." />
      </div>

      <!-- Genre filter -->
      <div class="genre-filter">
        <button
          v-for="g in genres"
          :key="g"
          :class="['genre-btn', { active: genre === g }]"
          @click="genre = g"
        >
          {{ g }}
        </button>
      </div>

      <!-- Book grid -->
      <div class="book-grid">
        <div v-if="filteredBooks.length > 0">
          <div
            v-for="(book, index) in filteredBooks"
            :key="index"
            class="book-card"
          >
            <h3>{{ book.title }}</h3>
            <p>{{ book.author }}</p>
            <span class="genre-tag">{{ book.genre }}</span>
          </div>
        </div>
        <p v-else class="no-results">No books found</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.search-page {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  color: #2c3e50;
}

/* Header (скопировано из твоего Home.vue) */
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
}

.btn-logout:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

/* Main */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
  text-align: center;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

/* Search input */
.search-bar input {
  width: 70%;
  max-width: 500px;
  padding: 12px 15px;
  border-radius: 10px;
  border: 1px solid #ccc;
  outline: none;
  transition: 0.2s;
  font-size: 1rem;
}

.search-bar input:focus {
  border-color: #667eea;
  box-shadow: 0 0 8px #667eea40;
}

/* Genre buttons */
.genre-filter {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin: 2rem 0;
}

.genre-btn {
  padding: 8px 15px;
  border-radius: 20px;
  border: none;
  background-color: #eee;
  cursor: pointer;
  transition: 0.2s;
  font-weight: 500;
}

.genre-btn.active {
  background-color: #667eea;
  color: white;
}

.genre-btn:hover {
  background-color: #d9e8ff;
}

/* Book cards */
.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.book-card {
  background: #fff;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  transition: 0.2s;
}

.book-card:hover {
  transform: translateY(-4px);
}

.book-card h3 {
  margin-bottom: 5px;
  font-size: 1.1rem;
}

.book-card p {
  color: #64748b;
  font-size: 0.95rem;
}

.genre-tag {
  display: inline-block;
  margin-top: 8px;
  font-size: 0.8rem;
  color: #667eea;
  background-color: #eef5ff;
  padding: 4px 8px;
  border-radius: 6px;
}

.no-results {
  grid-column: 1 / -1;
  color: #888;
  margin-top: 40px;
}
</style>
