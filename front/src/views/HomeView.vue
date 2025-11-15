<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import BookApiService from '../services/BookApiService'

const router = useRouter()
const authStore = useAuthStore()

// 💾 Берём ник из authStore или localStorage (если обновили страницу)
const userName = computed(() => {
  return authStore.user?.nickname || localStorage.getItem('nickname') || 'Reader'
})

// 📚 Данные
const featuredBooks = ref([])
const stats = ref({
  readingNow: 0,
  inPlans: 0,
  finished: 0,
  favorites: 0
})

const continueReading = ref(null)

// Загружаем последнюю читаемую книгу
const loadContinue = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('continueReading') || 'null')
    if (saved && saved.id) continueReading.value = saved
  } catch {
    continueReading.value = null
  }
}

onMounted(async () => {
  loadContinue()

  try {
    const res = await BookApiService.getBooks(1)
    const results = res?.results || []
    featuredBooks.value = results.map(BookApiService.parseBookData)

    const lib = JSON.parse(localStorage.getItem('myLibrary') || '[]')
    stats.value.readingNow = lib.filter(b => b._tab === 'Reading Now').length
    stats.value.inPlans = lib.filter(b => b._tab === 'In Plans').length
    stats.value.finished = lib.filter(b => b._tab === 'Finished').length
    stats.value.favorites = lib.filter(b => b._tab === 'Favorites').length
  } catch (err) {
    console.error('Home: error loading featured', err)
  }
})

// Навигация
const goToReading = () => {
  if (continueReading.value?.id) {
    router.push(`/reading/${continueReading.value.id}`)
  } else if (featuredBooks.value.length) {
    router.push(`/reading/${featuredBooks.value[0].id}`)
  }
}

const goToLibrary = (filter) => {
  router.push({ path: '/library', query: { filter } })
}

const openBook = (id) => {
  router.push({ name: 'book-details', params: { id } })
}
</script>

<template>
  <div class="home-container">
    <!-- Header -->
    <header class="home-header">
      <div>
        <h1>Hello, {{ userName }}!</h1>
        <p>Are you ready to continue your journey?</p>
      </div>
      <button class="discover-btn" @click="router.push('/search')">Discover Books</button>
    </header>

    <!-- Featured Books -->
    <section class="featured">
      <h2>Featured This Week</h2>
      <div class="book-list">
        <div
          v-for="book in featuredBooks"
          :key="book.id"
          class="book-card"
          @click="openBook(book.id)"
        >
          <div class="cover-wrap">
            <img v-if="book.coverImage" :src="book.coverImage" alt="cover" />
            <div v-else class="cover-placeholder">No cover</div>
          </div>
          <div class="meta">
            <strong class="title">{{ book.title }}</strong>
            <small class="author">{{ (book.authors && book.authors[0]) || 'Unknown' }}</small>
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
        <div v-if="continueReading">
          <p class="book-title">{{ continueReading.title }}</p>
          <p class="book-author">{{ continueReading.authors?.[0] || continueReading.author || 'Unknown' }}</p>
          <p class="progress">{{ continueReading.progress ?? 0 }}% complete — Chapter {{ continueReading.chapter ?? 1 }}</p>

          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: (continueReading.progress ?? 0) + '%' }"></div>
          </div>

          <button class="continue-btn">Continue Reading</button>
        </div>

        <div v-else class="no-continue">
          <p>No recent book. Open one to start reading.</p>
        </div>
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
  padding: 2rem 3rem 6rem;
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
  margin-bottom: 2.5rem;
}

.home-header h1 {
  font-size: 1.8rem;
  margin-bottom: 0.2rem;
  font-weight: 600;
  transition: color 0.3s ease;
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
  transition: background-color 0.2s;
}
.discover-btn:hover { background-color: #15257a; }

/* Featured */
.featured { margin-bottom: 2.5rem; }

.book-list {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.book-card {
  background: #f9fafb;
  border-radius: 10px;
  width: 160px;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.6rem;
  gap: 0.6rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: transform .15s, box-shadow .2s;
}
.book-card:hover { transform: translateY(-4px); box-shadow: 0 4px 16px rgba(0,0,0,0.1); }

.cover-wrap { width: 100%; height: 140px; display:flex; align-items:center; justify-content:center; }
.cover-wrap img { width:100%; height:100%; object-fit:cover; border-radius:8px; }
.cover-placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#e6e9ef; border-radius:8px; color:#666; }

.meta .title { display:block; margin-top:6px; font-size:0.95rem; text-align:center; }
.author { color:#666; font-size:0.85rem; }

/* Library stats */
.library-section { margin-bottom: 2.5rem; }
.library-stats { display:flex; gap:1rem; justify-content:space-between; flex-wrap:wrap; }

.stat-card {
  flex:1; min-width:140px; padding:1rem; border-radius:12px; text-align:center; cursor:pointer;
  transition: transform .12s, box-shadow .12s;
}
.stat-card:hover { transform: translateY(-6px); box-shadow: 0 8px 20px rgba(13,27,103,0.06); }

.stat-card.blue{ background:#eef3ff; color:#0d1b67 }
.stat-card.yellow{ background:#fff7e0; color:#b76b00 }
.stat-card.green{ background:#eafbee; color:#166534 }
.stat-card.pink{ background:#fdeef2; color:#9b1238 }

/* Continue Reading */
.continue-reading { margin-bottom: 2.5rem; }
.reading-card { background:#f3f6ff; padding:1rem; border-radius:14px; cursor:pointer; transition: transform .2s, box-shadow .2s; }
.reading-card:hover { box-shadow: 0 8px 20px rgba(13,27,103,0.05); transform: translateY(-4px); }
.book-title { font-weight:600; font-size:1.05rem; }
.book-author { color:#4b5563; }
.progress-bar { width:100%; background:#e6e6e6; height:8px; border-radius:8px; margin:8px 0; overflow:hidden; }
.progress-fill { height:100%; background:#0d1b67; transition: width 0.4s ease; }

.continue-btn {
  background-color: #0d1b67;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}
.continue-btn:hover { background-color: #15257a; }

/* Footer */
.footer {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  display:flex; justify-content:space-around; padding:1rem 0;
  border-top:1px solid #e6e6e6; background:#fff;
}
.footer button { background:none; border:none; font-size:1rem; cursor:pointer; color:#444; transition: color 0.2s; }
.footer button.active { color:#0d1b67; font-weight:600; }
.footer button:hover { color:#15257a; }
</style> <script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import lightliblogo from "@/assets/lightliblogo.png";

const router = useRouter();
const categories = ["Reading Now", "In Plans", "Finished", "Favorites"];
const library = ref({});
const selectedCategory = ref("Reading Now");
const searchQuery = ref("");

// Загружаем библиотеку при открытии
onMounted(() => {
  loadLibrary();
});

const loadLibrary = () => {
  const saved = JSON.parse(localStorage.getItem("lightlib-library") || "{}");

  // ✅ гарантируем, что все категории есть (даже если пустые)
  library.value = {
    "Reading Now": saved["Reading Now"] || [],
    "In Plans": saved["In Plans"] || [],
    "Finished": saved["Finished"] || [],
    "Favorites": saved["Favorites"] || [],
  };
};

// Фильтрация по поиску
const filteredBooks = computed(() => {
  const books = library.value[selectedCategory.value] || [];
  if (!searchQuery.value.trim()) return books;

  const q = searchQuery.value.toLowerCase();
  return books.filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      b.authors?.some((a) => a.name.toLowerCase().includes(q))
  );
});

// Удаление книги
const removeBook = (category, id) => {
  if (!confirm("Remove this book?")) return;
  library.value[category] = library.value[category].filter((b) => b.id !== id);
  localStorage.setItem("lightlib-library", JSON.stringify(library.value));
};

// Открытие деталей
const openBookDetails = (book) => {
  router.push({ name: "book-details", params: { id: book.id } });
};
</script>

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

<style scoped>
.library-container {
  padding: 1rem;
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
}

/* Header */
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

/* Tabs */
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

/* Search bar */
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

/* Books */
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

/* Empty */
.empty {
  text-align: center;
  color: #777;
  padding-top: 3rem;
}

/* Footer */
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
