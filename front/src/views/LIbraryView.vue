<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// вкладки
const tabs = ['Reading Now', 'In Plans', 'Finished', 'Favorites']
const activeTab = ref('Reading Now')

// состояния вкладок
const library = ref({
  'Reading Now': [],
  'In Plans': [],
  'Finished': [],
  'Favorites': []
})

// поиск
const searchQuery = ref('')
const books = ref([])
const loading = ref(false)
const searching = ref(false) // чтобы знать, показываем ли найденные книги

// поиск по Gutendex API
const searchBooks = async () => {
  if (!searchQuery.value.trim()) return
  loading.value = true
  searching.value = true
  try {
    const res = await axios.get(`https://gutendex.com/books?search=${searchQuery.value}`)
    books.value = res.data.results
  } catch (err) {
    console.error('Ошибка загрузки книг:', err)
  } finally {
    loading.value = false
  }
}

// добавить книгу в текущую вкладку
const addBook = (book) => {
  const tab = activeTab.value
  if (!library.value[tab].find(b => b.id === book.id)) {
    library.value[tab].push(book)
  }
}

// удалить книгу
const removeBook = (book) => {
  const tab = activeTab.value
  library.value[tab] = library.value[tab].filter(b => b.id !== book.id)
}

// проверить, есть ли книга в текущей вкладке
const isInCurrentTab = (book) => {
  const tab = activeTab.value
  return library.value[tab].some(b => b.id === book.id)
}

// закрыть результаты поиска
const closeSearchResults = () => {
  books.value = []
  searchQuery.value = ''
  searching.value = false
}

// открыть BookDetails.vue
const openBookDetails = (book) => {
  router.push({ name: 'book-details', params: { id: book.id } })
}
</script>

<template>
  <div class="library-container">
    <!-- Header -->
    <header class="library-header">
      <h1>📚 My Library</h1>
      <p>Manage your reading journey</p>
    </header>

    <!-- Tabs -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab"
        @click="activeTab = tab"
        :class="{ active: activeTab === tab }"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Search -->
    <section class="search-section">
      <input
        v-model="searchQuery"
        @keyup.enter="searchBooks"
        placeholder="Search for books..."
        class="search-input"
      />
      <button @click="searchBooks" class="search-btn">Search</button>
      <button
        v-if="searching"
        @click="closeSearchResults"
        class="close-btn"
      >
        ✖ Close
      </button>
    </section>

    <!-- Loading -->
    <div v-if="loading" class="loading">Loading...</div>

    <!-- Search Results -->
    <section v-if="!loading && searching && books.length" class="book-list">
      <h2>Results</h2>
      <div class="book-grid">
        <div v-for="book in books" :key="book.id" class="book-card">
          <img
            v-if="book.formats['image/jpeg']"
            :src="book.formats['image/jpeg']"
            alt="cover"
            class="book-cover"
          />
          <h3>{{ book.title }}</h3>
          <p v-if="book.authors?.length">{{ book.authors[0].name }}</p>

          <button
            v-if="!isInCurrentTab(book)"
            @click="addBook(book)"
            class="add-btn"
          >
            ➕ Add
          </button>
          <button
            v-else
            @click="removeBook(book)"
            class="remove-btn"
          >
            ❌ Remove
          </button>

          <button @click="openBookDetails(book)" class="details-btn">
            📖 Details
          </button>
        </div>
      </div>
    </section>

    <!-- Current Tab Books -->
    <section v-if="!searching && library[activeTab].length" class="my-books">
      <h2>{{ activeTab }}</h2>
      <div class="book-grid">
        <div v-for="book in library[activeTab]" :key="book.id" class="book-card">
          <img
            v-if="book.formats['image/jpeg']"
            :src="book.formats['image/jpeg']"
            alt="cover"
            class="book-cover"
          />
          <h3>{{ book.title }}</h3>
          <p v-if="book.authors?.length">{{ book.authors[0].name }}</p>
          <button @click="removeBook(book)" class="remove-btn">🗑 Remove</button>
          <button @click="openBookDetails(book)" class="details-btn">📖 Details</button>
        </div>
      </div>
    </section>

    <p v-else-if="!loading && !searching" class="empty-text">
      No books yet in "{{ activeTab }}"
    </p>

    <!-- Bottom Navigation -->
    <footer class="footer">
      <button @click="router.push('/home')">🏠 Home</button>
      <button @click="router.push('/search')">🔍 Search</button>
      <button class="active" @click="router.push('/library')">📚 Library</button>
      <button @click="router.push('/profile')">👤 Profile</button>
    </footer>
  </div>
</template>

<style scoped>
.library-container {
  padding: 1.5rem 2rem;
  font-family: 'Inter', sans-serif;
  color: #222;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #fff;
}

/* Header */
.library-header {
  text-align: center;
  margin-bottom: 1rem;
}

/* Tabs */
.tabs {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1.2rem;
}
.tabs button {
  flex: 1;
  border: none;
  padding: 0.5rem;
  background: #f3f4f6;
  border-radius: 8px;
  margin: 0 0.3rem;
  cursor: pointer;
  font-weight: 500;
}
.tabs button.active {
  background: #0d1b67;
  color: #fff;
}

/* Search */
.search-section {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.search-input {
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  width: 60%;
}
.search-btn {
  background-color: #0d1b67;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
}
.close-btn {
  background-color: #ccc;
  color: #333;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  cursor: pointer;
}

/* Books */
.book-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}
.book-card {
  background: #f9fafb;
  border-radius: 12px;
  width: 160px;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.book-cover {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}
.add-btn, .remove-btn, .details-btn {
  border: none;
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  font-weight: 500;
  margin-top: 0.2rem;
}
.add-btn {
  background-color: #e5edff;
}
.remove-btn {
  background-color: #ffe5e5;
}
.details-btn {
  background-color: #eef3ff;
}

/* Empty */
.empty-text {
  text-align: center;
  color: #777;
  margin-top: 2rem;
}

/* Footer */
.footer {
  margin-top: auto;
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #e5e7eb;
  padding: 1rem 0;
  background: #fff;
  position: sticky;
  bottom: 0;
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
