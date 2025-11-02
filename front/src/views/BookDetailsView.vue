<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const book = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const res = await axios.get(`http://localhost:3000/api/books/${route.params.id}`)
    book.value = res.data
  } catch (err) {
    console.error('Ошибка загрузки книги:', err)
    error.value = 'Не удалось загрузить книгу'
  } finally {
    loading.value = false
  }
})

const startReading = () => {
  if (book.value?.id) router.push(`/reading/${book.value.id}`)
}

const addToFavorites = async () => {
  try {
    await axios.post(`http://localhost:3000/api/user/favorites`, { bookId: book.value.id })
    alert('Добавлено в избранное!')
  } catch {
    alert('Ошибка при добавлении в избранное.')
  }
}
</script>

<template>
  <div class="book-details-container">
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="book-details">
      <img
        :src="book.cover || 'https://via.placeholder.com/300x400?text=No+Cover'"
        alt="Book cover"
        class="book-cover"
      />

      <div class="book-info">
        <h1>{{ book.title }}</h1>
        <h3>by {{ book.author }}</h3>
        <p class="description">{{ book.description || 'No description available.' }}</p>

        <div class="actions">
          <button class="read-btn" @click="startReading">📖 Start Reading</button>
          <button class="fav-btn" @click="addToFavorites">❤️ Add to Favorites</button>
        </div>
      </div>
    </div>

    <footer class="footer">
      <button @click="router.push('/home')">🏠</button>
      <button @click="router.push('/search')">🔍</button>
      <button @click="router.push('/library')">📚</button>
      <button @click="router.push('/profile')">👤</button>
    </footer>
  </div>
</template>

<style scoped>
.book-details-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #fff;
  color: #222;
  padding: 2rem;
}

.book-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.book-cover {
  width: 240px;
  height: 340px;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
}

.book-info h1 {
  font-size: 1.8rem;
  margin-bottom: 0.3rem;
}

.book-info h3 {
  font-weight: 400;
  color: #555;
  margin-bottom: 1.2rem;
}

.description {
  font-size: 0.95rem;
  line-height: 1.6;
  max-width: 600px;
  margin-bottom: 2rem;
  color: #444;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.read-btn, .fav-btn {
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.4rem;
  font-weight: 500;
  cursor: pointer;
}

.read-btn {
  background-color: #0d1b67;
  color: #fff;
}

.fav-btn {
  background-color: #f3f4f6;
  color: #222;
}

/* Footer */
.footer {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #eee;
  padding: 1rem 0;
  margin-top: auto;
}
.footer button {
  background: none;
  border: none;
  font-size: 1.3rem;
  cursor: pointer;
  color: #444;
}
</style>
