<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import lightliblogo from "@/assets/lightliblogo.png";

const router = useRouter();

// состояния
const searchQuery = ref("");
const books = ref([]);
const loading = ref(false);
const genres = ["Fiction", "Science", "History", "Philosophy", "Fantasy", "Poetry", "Drama"];
const selectedGenre = ref("");

const showCategoryPicker = ref(false);
const selectedBook = ref(null);
const categories = ["Reading Now", "In Plans", "Finished", "Favorites"];

// переключатель для показа жанров
const showGenres = ref(false);

// загрузка книг
const fetchBooks = async (query = "", genre = "") => {
  loading.value = true;
  try {
    let url = "https://gutendex.com/books?";
    if (query) url += `search=${encodeURIComponent(query)}&`;
    if (genre) url += `topic=${encodeURIComponent(genre)}&`;
    const res = await axios.get(url);
    books.value = res.data.results;
  } catch (err) {
    console.error("Ошибка загрузки книг:", err);
  } finally {
    loading.value = false;
  }
};

// старт — рандомные книги
onMounted(() => {
  fetchBooks();
});

const searchBooks = () => {
  fetchBooks(searchQuery.value, selectedGenre.value);
};

const applyFilter = (genre) => {
  selectedGenre.value = genre;
  showGenres.value = false; // скрываем панель жанров после выбора
  fetchBooks(searchQuery.value, genre);
};

// выбор категории
const pickCategory = (book) => {
  selectedBook.value = book;
  showCategoryPicker.value = true;
};

// добавление в библиотеку
const addBookToLibrary = (category) => {
  const key = "lightlib-library";
  const existing = JSON.parse(localStorage.getItem(key) || "{}");

  if (!existing[category]) existing[category] = [];

  const alreadyAdded = existing[category].some((b) => b.id === selectedBook.value.id);
  if (!alreadyAdded) existing[category].push(selectedBook.value);

  localStorage.setItem(key, JSON.stringify(existing));
  showCategoryPicker.value = false;
  selectedBook.value = null;
  alert(`✅ Book added to "${category}"!`);
};

const openBookDetails = (book) => {
  router.push({ name: "book-details", params: { id: book.id } });
};

// переключатель панели жанров
const toggleGenres = () => {
  showGenres.value = !showGenres.value;
};
</script>

<template>
  <div class="search-container" @click.stop>
    <!-- Header -->
    <header class="search-header">
      <img :src="lightliblogo" alt="logo" class="logo" />
      <div class="search-bar">
        <input
          v-model="searchQuery"
          @keyup.enter="searchBooks"
          placeholder="Search for books..."
        />
        <button @click="searchBooks" class="search-btn">🔍</button>
      </div>
    </header>

    <!-- Filters + Genres Toggle -->
    <div class="filters-row">
      <div class="filters">
        <button
          v-for="genre in genres"
          :key="genre"
          @click="applyFilter(genre)"
          :class="{ active: selectedGenre === genre }"
        >
          {{ genre }}
        </button>
      </div>

      <!-- Кнопка "Genres" с выезжающей панелью -->
      <div class="genres-toggle">
        <button @click.stop="toggleGenres" class="genres-btn">
          Genres ▾
        </button>

        <transition name="slide-fade">
          <div v-if="showGenres" class="genre-picker" @click.stop>
            <button
              v-for="g in genres"
              :key="g"
              @click="applyFilter(g)"
              :class="{ active: selectedGenre === g }"
              class="genre-item"
            >
              {{ g }}
            </button>
            <button @click="applyFilter('')" class="genre-item clear">
              All
            </button>
          </div>
        </transition>
      </div>
    </div>

    <!-- Books Grid -->
    <div v-if="loading" class="loading">Loading books...</div>
    <div v-else class="book-grid">
      <div v-for="book in books" :key="book.id" class="book-card">
        <img
          v-if="book.formats['image/jpeg']"
          :src="book.formats['image/jpeg']"
          alt="cover"
          class="book-cover"
        />
        <h3 class="book-title">{{ book.title }}</h3>
        <p v-if="book.authors?.length" class="book-author">
          {{ book.authors[0].name }}
        </p>
        <button @click="pickCategory(book)" class="add-btn">➕ Add</button>
        <button @click="openBookDetails(book)" class="details-btn">
          📖 Details
        </button>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showCategoryPicker" class="modal-backdrop">
      <div class="modal">
        <h3>Select category</h3>
        <div class="category-list">
          <button
            v-for="cat in categories"
            :key="cat"
            @click="addBookToLibrary(cat)"
          >
            {{ cat }}
          </button>
        </div>
        <button @click="showCategoryPicker = false" class="cancel-btn">
          Cancel
        </button>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <button @click="router.push('/home')">Home</button>
      <button class="active" @click="router.push('/search')">Search</button>
      <button @click="router.push('/library')">Library</button>
      <button @click="router.push('/profile')">Profile</button>
    </footer>
  </div>
</template>

<style scoped>
.search-container {
  padding: 1rem;
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.search-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.logo {
  height: 40px;
}
.search-bar {
  flex: 1;
  display: flex;
  background: #f3f4f6;
  border-radius: 12px;
  overflow: hidden;
}
.search-bar input {
  flex: 1;
  border: none;
  padding: 0.6rem 1rem;
  outline: none;
  background: transparent;
}
.search-btn {
  background: #0d1b67;
  color: white;
  border: none;
  padding: 0 1rem;
  cursor: pointer;
}

/* Filters row */
.filters-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.filters button {
  padding: 0.4rem 0.8rem;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
}
.filters button.active {
  background: #0d1b67;
  color: white;
}

/* Toggle genres */
.genres-toggle {
  position: relative;
}
.genres-btn {
  padding: 0.45rem 0.7rem;
  border-radius: 8px;
  border: none;
  background: #eef2ff;
  cursor: pointer;
  font-weight: 600;
}
.genre-picker {
  position: absolute;
  right: 0;
  top: 110%;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  background: white;
  padding: 0.6rem;
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(13, 27, 103, 0.12);
  z-index: 30;
  min-width: 160px;
}
.genre-item {
  border: none;
  background: #f3f4f6;
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
}
.genre-item.active {
  background: #0d1b67;
  color: white;
}
.genre-item.clear {
  background: #fff7ed;
}

/* transition */
.slide-fade-enter-active {
  transition: all 180ms cubic-bezier(.2,.8,.2,1);
}
.slide-fade-leave-active {
  transition: opacity 120ms;
}
.slide-fade-enter-from {
  transform: translateY(-6px);
  opacity: 0;
}
.slide-fade-enter-to {
  transform: translateY(0);
  opacity: 1;
}
.slide-fade-leave-from {
  opacity: 1;
}
.slide-fade-leave-to {
  opacity: 0;
}

.book-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}
.book-card {
  width: 150px;
  background: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  padding: 0.8rem;
  transition: transform 0.2s;
}
.book-card:hover {
  transform: translateY(-4px);
}
.book-cover {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
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
}
.add-btn,
.details-btn {
  border: none;
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  font-weight: 500;
  margin-top: 0.2rem;
  width: 100%;
}
.add-btn {
  background-color: #e5edff;
}
.details-btn {
  background-color: #eef3ff;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
.category-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1rem 0;
}
.category-list button {
  border: none;
  background: #0d1b67;
  color: white;
  padding: 0.6rem;
  border-radius: 8px;
  cursor: pointer;
}
.cancel-btn {
  background: #ccc;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
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
