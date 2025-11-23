<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { libraryAPI, readingAPI } from '../services/api'

const isOpen = ref(false)
const router = useRouter()
const openDropdown = ref(null)

const activeTab = ref('reading')
const books = ref([])
const progress = ref({})
const loading = ref(false)
const searchQuery = ref('')
const viewMode = ref('grid')

const tabs = [
  { value: 'reading', label: 'Reading Now' },
  { value: 'plan', label: 'In Plans' },
  { value: 'finished', label: 'Finished' },
  { value: 'favorite', label: 'Favorites' },
]

const filteredBooks = computed(() => {
  if (!searchQuery.value) return books.value

  const query = searchQuery.value.toLowerCase()
  return books.value.filter(
    (book) => book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query),
  )
})

const fetchLibrary = async () => {
  loading.value = true
  try {
    const response = await libraryAPI.getLibrary(activeTab.value)
    books.value = response.data

    for (const book of books.value) {
      if (activeTab.value === 'reading') {
        const progressResponse = await readingAPI.getProgress(book.book_id)
        progress.value[book.book_id] = progressResponse.data
      }
    }
  } catch (error) {
    console.error('Failed to fetch library:', error)
  } finally {
    loading.value = false
  }
}

const changeTab = (tab) => {
  activeTab.value = tab
  fetchLibrary()
}

const startReading = (bookId) => {
  router.push(`/read/${bookId}`)
}

const viewBookDetails = (bookId) => {
  router.push(`/book/${bookId}`)
}

const removeBook = async (bookId) => {
  if (!confirm('Remove this book from your library?')) return

  try {
    await libraryAPI.removeFromLibrary(bookId)
    books.value = books.value.filter((b) => b.book_id !== bookId)
  } catch (error) {
    alert('Failed to remove book')
  }
}

const changeStatus = async (bookId, newStatus) => {
  try {
    await libraryAPI.updateStatus(bookId, newStatus)
    books.value = books.value.filter((b) => b.book_id !== bookId)
  } catch (error) {
    alert('Failed to update status')
  }
}

onMounted(() => {
  fetchLibrary()
})
</script>

<template>
  <div class="library-view">
    <header class="library-header">
      <button @click="router.push('/')" class="back-btn">← Back</button>
      <h1>My Library</h1>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search library..."
        class="search-input"
      />
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
    </header>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="changeTab(tab.value)"
        :class="['tab', { active: activeTab === tab.value }]"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="library-content">
      <div class="section-header">
        <h2>{{ tabs.find((t) => t.value === activeTab)?.label }}</h2>
        <p class="book-count">{{ filteredBooks.length }} books</p>
        <button v-if="activeTab === 'reading'" @click="router.push('/')" class="add-books-btn">
          + Add Books
        </button>
      </div>

      <div v-if="loading" class="loading">Loading...</div>

      <div v-else-if="filteredBooks.length === 0" class="empty-state">
        <p>No books in this section yet.</p>
        <button @click="router.push('/')" class="browse-btn">Browse Books</button>
      </div>

      <div v-else :class="['books-grid', viewMode]">
        <div v-for="book in filteredBooks" :key="book.book_id" class="library-book-card">
          <img
            v-if="book.cover_image"
            :src="book.cover_image"
            :alt="book.title"
            class="book-cover"
            @click="viewBookDetails(book.book_id)"
          />
          <div v-else class="book-cover-placeholder" @click="viewBookDetails(book.book_id)">📖</div>

          <div class="book-details">
            <h3 class="book-title" @click="viewBookDetails(book.book_id)">
              {{ book.title }}
            </h3>
            <p class="book-author">{{ book.author }}</p>

            <div v-if="progress[book.book_id]" class="progress-info">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: `${progress[book.book_id].percentage}%` }"
                ></div>
              </div>
              <p class="progress-text">
                {{ progress[book.book_id].percentage }}% • Chapter
                {{ progress[book.book_id].current_chapter }}
              </p>
            </div>

            <div class="actions">
              <button
                v-if="activeTab === 'reading'"
                @click="startReading(book.book_id)"
                class="action-btn primary"
              >
                Continue Reading
              </button>
              <button
                v-else-if="activeTab === 'plan'"
                @click="startReading(book.book_id)"
                class="action-btn primary"
              >
                Start Reading
              </button>
              <button v-else @click="startReading(book.book_id)" class="action-btn primary">
                Read Again
              </button>

              <div class="dropdown" :class="{ open: openDropdown === book.book_id }">
                <button
                  class="action-btn secondary"
                  @click="openDropdown = openDropdown === book.book_id ? null : book.book_id"
                >
                  ⋮
                </button>

                <div class="dropdown-menu">
                  <button @click="changeStatus(book.book_id, 'reading')">Mark as Reading</button>
                  <button @click="changeStatus(book.book_id, 'finished')">Mark as Finished</button>
                  <button @click="changeStatus(book.book_id, 'favorite')">Add to Favorites</button>
                  <button @click="removeBook(book.book_id)" class="danger">Remove</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.library-view {
  min-height: 100vh;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: var(--color-background);
  color: var(--color-text);
}

.library-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-btn {
  padding: 0.5rem 1rem;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}

.library-header h1 {
  font-size: 2rem;
  flex: 1;
}

.search-input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--color-background-soft);
  width: 300px;
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
  background: #04103c3a;
  border-color: #04103c;
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid var(--color-border);
}

.tab {
  padding: 1rem 2rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: var(--color-text);
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
}

.tab.active {
  color: #04103c;
  border-bottom-color: #04103c;
  font-weight: 600;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.section-header h2 {
  flex: 1;
  font-size: 1.5rem;
}

.book-count {
  color: var(--color-text);
}

.add-books-btn {
  padding: 0.75rem 1.5rem;
  background: #04103c;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.loading {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
}

.empty-state {
  text-align: center;
  padding: 4rem;
}

.empty-state p {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.browse-btn {
  padding: 0.75rem 2rem;
  background: #04103c;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.books-grid.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.books-grid.list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.library-book-card {
  display: flex;
  gap: 1rem;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  transition: transform 0.2s;
}

.books-grid.grid .library-book-card {
  flex-direction: column;
}

.library-book-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.book-cover {
  width: 100%;
  height: 300px;
  object-fit: cover;
  cursor: pointer;
  border-radius: 12px 12px 0 0;
}

.books-grid.grid .book-cover {
  height: 300px;
}

.books-grid.list .book-cover {
  width: 150px;
  height: 200px;
}

.book-cover-placeholder {
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  background: var(--color-background-mute);
  cursor: pointer;
}

.book-details {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.book-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-heading);
  cursor: pointer;
}

.book-title:hover {
  color: #04103c;
}

.book-author {
  color: var(--color-text);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.progress-info {
  margin-bottom: 1rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--color-background-mute);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: #04103c;
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.85rem;
  color: var(--color-text);
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.action-btn.primary {
  flex: 1;
  background: #04103c;
  color: white;
}

.action-btn.primary:hover {
  background: #04103c;
}

.action-btn.secondary {
  background: var(--color-background-mute);
  color: var(--color-text);
  padding: 0.5rem 0.75rem;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  display: none;
  position: absolute;
  bottom: 100%;
  right: 0;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 180px;
}

.dropdown.open .dropdown-menu {
  display: block;
}

.dropdown-menu button {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  color: var(--color-text);
}

.dropdown-menu button:hover {
  background: var(--color-background-soft);
}

.dropdown-menu button.danger {
  color: #dc3545;
}

@media (max-width: 768px) {
  .library-header {
    flex-wrap: wrap;
  }

  .library-header h1 {
    width: 100%;
  }

  .search-input {
    width: 100%;
  }

  .books-grid.grid {
    grid-template-columns: 1fr;
  }
}
</style>
