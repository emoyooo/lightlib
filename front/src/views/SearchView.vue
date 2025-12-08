<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { booksAPI, libraryAPI } from '../services/api'
import { useAuthStore } from '../stores/auth'
import TopNavbar from '../components/TopNavbar.vue'

const router = useRouter()
const authStore = useAuthStore()

const searchQuery = ref('')
const books = ref([])
const loading = ref(false)
const selectedGenre = ref('all')
const sortBy = ref('popular')
const viewMode = ref('grid')
const currentPage = ref(1)
const totalCount = ref(0)
const showFilters = ref(false)

const genres = [
  { value: 'all', label: 'All' },
  { value: 'fiction', label: 'Fiction' },
  { value: 'science', label: 'Science' },
  { value: 'history', label: 'History' },
  { value: 'philosophy', label: 'Philosophy' },
]

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'ascending', label: 'Title A-Z' },
  { value: 'descending', label: 'Title Z-A' },
]

const fetchBooks = async () => {
  loading.value = true
  try {
    let response
    if (searchQuery.value) {
      response = await booksAPI.search(searchQuery.value, currentPage.value)
    } else {
      const genre = selectedGenre.value === 'all' ? null : selectedGenre.value
      response = await booksAPI.getBooks(currentPage.value, genre, sortBy.value)
    }
    books.value = response.data.results
    totalCount.value = response.data.count
  } catch (error) {
    console.error('Failed to fetch books:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchBooks()
}

const addToLibrary = async (book) => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  try {
    await libraryAPI.addToLibrary({
      bookId: book.id,
      title: book.title,
      author: book.authors[0] || 'Unknown',
      coverImage: book.coverImage,
      status: 'plan',
    })
    alert('Book added to library!')
  } catch (error) {
    alert(error.response?.data?.error || 'Failed to add book')
  }
}

const viewBookDetails = (bookId) => {
  router.push(`/book/${bookId}`)
}

watch([selectedGenre, sortBy], () => {
  currentPage.value = 1
  fetchBooks()
})

onMounted(() => {
  fetchBooks()
})
</script>

<template>
  <TopNavbar />
  <div class="search-view">
    <div class="search-content">
      <div class="search-header">
        <div class="search-bar">
          <input
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="Search books, authors..."
            class="search-input"
          />
          <button @click="handleSearch" class="search-btn">Search</button>
        </div>

        <div class="controls">
          <button @click="showFilters = !showFilters" class="filter-btn">
            <font-awesome-icon :icon="['fas', 'filter']" />
            Filters
          </button>
          <div class="view-toggle">
            <button
              @click="viewMode = 'grid'"
              :class="{ active: viewMode === 'grid' }"
              class="view-btn"
            >
              ▦
            </button>
            <button
              @click="viewMode = 'list'"
              :class="{ active: viewMode === 'list' }"
              class="view-btn"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      <div v-if="showFilters" class="filters">
        <div class="filter-group">
          <label>Genre:</label>
          <select v-model="selectedGenre" class="filter-select">
            <option v-for="genre in genres" :key="genre.value" :value="genre.value">
              {{ genre.label }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Sort by:</label>
          <select v-model="sortBy" class="filter-select">
            <option v-for="option in sortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="results-info">
        <p>{{ totalCount }} books found</p>
      </div>

      <div v-if="loading" class="loading">Loading...</div>

      <div v-else :class="['books-container', viewMode]">
        <div
          v-for="book in books"
          :key="book.id"
          class="book-card"
          @click="viewBookDetails(book.id)"
        >
          <img v-if="book.coverImage" :src="book.coverImage" :alt="book.title" class="book-cover" />
          <div v-else class="book-cover-placeholder">📖</div>

          <div class="book-info">
            <h3 class="book-title">{{ book.title }}</h3>
            <p class="book-author">{{ book.authors.join(', ') || 'Unknown' }}</p>
            <div class="book-meta">
              <span v-if="book.languages" class="language">
                {{ book.languages[0]?.toUpperCase() }}
              </span>
              <span class="downloads">↓ {{ book.downloadCount }}</span>
            </div>
            <button @click.stop="addToLibrary(book)" class="add-btn">+ Add to Library</button>
          </div>
        </div>
      </div>

      <div v-if="!loading && books.length === 0" class="no-results">
        No books found. Try a different search.
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-view {
  min-height: 100vh;
  background: var(--color-background);
}

.search-content {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.search-header {
  margin-bottom: 2rem;
}

.search-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--color-background-soft);
}

.search-btn {
  padding: 0.75rem 2rem;
  background: #04103c;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.search-btn:hover {
  background: #030c2e;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-btn {
  padding: 0.5rem 1rem;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  padding: 0.5rem 1rem;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
}

.view-btn.active {
  background: rgba(4, 16, 60, 0.2);
  border-color: #04103c;
}

.filters {
  display: flex;
  gap: 2rem;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
}

.results-info {
  margin-bottom: 1rem;
  color: var(--color-text);
}

.loading {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
}

.books-container.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
}

.books-container.list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.book-card {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.book-cover {
  width: 100%;
  height: 350px;
  object-fit: cover;
}

.book-cover-placeholder {
  width: 100%;
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  background: var(--color-background-mute);
}

.book-info {
  padding: 1rem;
}

.book-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-heading);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-author {
  color: var(--color-text);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.book-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: var(--color-text);
}

.add-btn {
  width: 100%;
  padding: 0.5rem;
  background: #04103c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.add-btn:hover {
  background: #030c2e;
}

.no-results {
  text-align: center;
  padding: 3rem;
  font-size: 1.1rem;
  color: var(--color-text);
}
</style>
