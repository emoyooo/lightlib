<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const book = ref(null)
const pages = ref([])
const currentPage = ref(0)
const fontSize = ref(18)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await axios.get(`http://localhost:3000/api/books/${route.params.id}/text`)
    const text = res.data.text || 'No content available.'
    pages.value = text.match(/.{1,800}/g) // делим текст на "страницы"
    book.value = res.data.book
  } catch (err) {
    console.error('Ошибка загрузки текста:', err)
  } finally {
    loading.value = false
  }
})

const nextPage = () => {
  if (currentPage.value < pages.value.length - 1) currentPage.value++
}
const prevPage = () => {
  if (currentPage.value > 0) currentPage.value--
}
</script>

<template>
  <div class="reading-container">
    <div v-if="loading" class="loading">Loading book...</div>
    <div v-else class="content">
      <header>
        <button @click="router.back()" class="back-btn">←</button>
        <h2>{{ book?.title || 'Book Title' }}</h2>
      </header>

      <main :style="{ fontSize: fontSize + 'px' }">
        <p>{{ pages[currentPage] }}</p>
      </main>

      <footer>
        <div class="controls">
          <button @click="prevPage" :disabled="currentPage === 0">⬅️</button>
          <span>{{ currentPage + 1 }} / {{ pages.length }}</span>
          <button @click="nextPage" :disabled="currentPage === pages.length - 1">➡️</button>
        </div>

        <div class="font-controls">
          <button @click="fontSize -= 1" :disabled="fontSize <= 14">A-</button>
          <button @click="fontSize += 1" :disabled="fontSize >= 24">A+</button>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.reading-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #fafafa;
  padding: 1.5rem;
  color: #222;
}

header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.2rem;
}

.back-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

main {
  flex: 1;
  line-height: 1.7;
  white-space: pre-line;
  text-align: justify;
}

footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
}

.controls button,
.font-controls button {
  background: #f3f4f6;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}
</style>
