<template>
  <div class="library-container">
    <!-- Header -->
    <header class="library-header">
      <img :src="lightliblogo" alt="logo" class="logo" />
      <h1 class="title">My Library</h1>
    </header>

    <!-- Category Tabs -->
    <div class="category-tabs">
      <button
        v-for="cat in categories"
        :key="cat"
        @click="selectedCategory = cat"
        :class="{ active: selectedCategory === cat }"
      >
        {{ cat }}
      </button>
    </div>

    <!-- Search Bar -->
    <div class="search-bar">
      <input
        v-model="searchQuery"
        placeholder="Search in your library..."
        class="search-input"
      />
      <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
        ✖
      </button>
    </div>

    <!-- Books -->
    <div class="books-section">
      <div v-if="filteredBooks.length === 0" class="empty">
        <p>
          <span v-if="!searchQuery">No books yet in "{{ selectedCategory }}"</span>
          <span v-else>No results for "{{ searchQuery }}"</span>
        </p>
      </div>

      <div v-else class="book-grid">
        <div v-for="book in filteredBooks" :key="book.id" class="book-card">
          <img
            v-if="book.formats?.['image/jpeg']"
            :src="book.formats['image/jpeg']"
            alt="cover"
            class="book-cover"
          />
          <h3 class="book-title">{{ book.title }}</h3>
          <p v-if="book.authors?.length" class="book-author">
            {{ book.authors[0].name }}
          </p>
          <button class="details-btn" @click="openBookDetails(book)">
            📖 Details
          </button>
          <button class="remove-btn" @click="removeBook(selectedCategory, book.id)">
            ❌ Remove
          </button>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <button @click="router.push('/home')">🏠</button>
      <button @click="router.push('/search')">🔍</button>
      <button class="active" @click="router.push('/library')">📚</button>
      <button @click="router.push('/profile')">👤</button>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import lightliblogo from '@/assets/lightliblogo.png'

const router = useRouter()

// Категории библиотеки
const categories = ["Reading Now", "In Plans", "Finished", "Favorites"]

// Состояние библиотеки
const library = ref({})
const selectedCategory = ref("Reading Now")
const searchQuery = ref("")

// 🔥 Универсальный загрузчик библиотеки
const loadLibrary = () => {
  const raw = localStorage.getItem("lightlib-library")

  if (!raw) {
    // если данных нет — создаём пустую структуру
    library.value = {
      "Reading Now": [],
      "In Plans": [],
      "Finished": [],
      "Favorites": [],
    }
    return
  }

  let saved
  try {
    saved = JSON.parse(raw)
  } catch (e) {
    saved = {}
  }

  // 🔥 Старый формат — массив книг
  if (Array.isArray(saved)) {
    const grouped = {
      "Reading Now": [],
      "In Plans": [],
      "Finished": [],
      "Favorites": []
    }

    saved.forEach(b => {
      const tab = b._tab || "Reading Now"
      if (!grouped[tab]) grouped[tab] = []
      grouped[tab].push(b)
    })

    library.value = grouped
    return
  }

  // 🔥 Новый формат — объект
  library.value = {
    "Reading Now": saved["Reading Now"] || [],
    "In Plans": saved["In Plans"] || [],
    "Finished": saved["Finished"] || [],
    "Favorites": saved["Favorites"] || [],
  }
}

onMounted(loadLibrary)

// Книги с фильтрацией
const filteredBooks = computed(() => {
  const books = library.value[selectedCategory.value] || []
  if (!searchQuery.value.trim()) return books
  const q = searchQuery.value.toLowerCase()
  return books.filter(
    b =>
      b.title?.toLowerCase().includes(q) ||
      b.authors?.some(a => a.name?.toLowerCase().includes(q))
  )
})

// Удаление книги
const removeBook = (category, id) => {
  if (!confirm("Remove this book?")) return
  library.value[category] = library.value[category].filter(b => b.id !== id)
  localStorage.setItem("lightlib-library", JSON.stringify(library.value))
}

// Открытие деталей
const openBookDetails = (book) => {
  router.push({ name: "book-details", params: { id: book.id } })
}
</script>

<style scoped>
/* ТВОЙ CSS — полностью без изменений */
.library-container {
  padding: 1rem;
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
}

.library-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1rem;
}
.logo {
  height: 40px;
}
.title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #0d1b67;
}

.category-tabs {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  gap: 0.4rem;
}
.category-tabs button {
  flex: 1;
  padding: 0.6rem;
  border: none;
  border-radius: 10px;
  background: #f3f4f6;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
}
.category-tabs button:hover {
  background: #e6e7eb;
}
.category-tabs button.active {
  background: #0d1b67;
  color: white;
}

.search-bar {
  display: flex;
  justify-content: center;
  position: relative;
  margin-bottom: 1rem;
}
.search-input {
  width: 80%;
  padding: 0.6rem 1rem;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 0.95rem;
}
.clear-btn {
  position: absolute;
  right: 12%;
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #666;
}

.book-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}
.book-card {
  width: 150px;
  background: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 0.8rem;
  text-align: center;
  transition: transform 0.2s;
}
.book-card:hover {
  transform: translateY(-4px);
}
.book-cover {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  object-fit: cover;
  margin-bottom: 0.5rem;
}
.book-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
}
.book-author {
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 0.5rem;
}
.details-btn,
.remove-btn {
  width: 100%;
  padding: 0.4rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
  margin-bottom: 0.3rem;
}
.details-btn {
  background: #e5edff;
}
.details-btn:hover {
  background: #d9e5ff;
}
.remove-btn {
  background: #ffe5e5;
}
.remove-btn:hover {
  background: #ffcccc;
}

.empty {
  text-align: center;
  color: #777;
  padding-top: 3rem;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-around;
  padding: 0.8rem 0;
}
.footer button {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #444;
}
.footer button.active {
  color: #0d1b67;
  font-weight: 600;
}
</style>
