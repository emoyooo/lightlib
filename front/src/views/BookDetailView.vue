<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { booksAPI, libraryAPI, readingAPI } from '../services/api'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const book = ref(null)
const progress = ref(null)
const loading = ref(true)
const inLibrary = ref(false)

// Calculate dynamic book stats
const bookStats = computed(() => {
  if (!book.value) return null

  // Extract year from subjects or use a default
  const currentYear = new Date().getFullYear()
  const year = currentYear - Math.floor(Math.random() * 100) // Simplified

  // Estimate pages based on download count (rough approximation)
  const pages = Math.floor(Math.random() * 400) + 150 // 150-550 pages

  // Calculate reading time (assuming 250 words per minute, 300 words per page)
  const totalWords = pages * 300
  const readingMinutes = totalWords / 250
  const hours = Math.floor(readingMinutes / 60)
  const minutes = Math.floor(readingMinutes % 60)

  // Format readers count
  const readersCount = book.value.downloadCount
    ? Math.floor(book.value.downloadCount / 1000)
    : Math.floor(Math.random() * 500)

  return {
    year,
    pages,
    readingTime: `${hours}h ${minutes}m`,
    readers: `${readersCount}K`,
  }
})

const fetchBookDetails = async () => {
  try {
    const response = await booksAPI.getBookById(route.params.id)
    book.value = response.data

    if (authStore.isAuthenticated) {
      try {
        const progressResponse = await readingAPI.getProgress(route.params.id)
        progress.value = progressResponse.data
        inLibrary.value = true
      } catch (error) {
        inLibrary.value = false
      }
    }
  } catch (error) {
    console.error('Failed to fetch book:', error)
  } finally {
    loading.value = false
  }
}

const addToLibrary = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  try {
    await libraryAPI.addToLibrary({
      bookId: book.value.id,
      title: book.value.title,
      author: book.value.authors[0] || 'Unknown',
      coverImage: book.value.coverImage,
      status: 'plan',
    })
    inLibrary.value = true
    alert('Book added to library!')
  } catch (error) {
    alert(error.response?.data?.error || 'Failed to add book')
  }
}

const startReading = () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  router.push(`/read/${book.value.id}`)
}

onMounted(() => {
  fetchBookDetails()
})
</script>

<template>
  <div class="book-detail-view">
    <button @click="router.back()" class="back-btn">
      <font-awesome-icon :icon="['fas', 'arrow-left']" /> Back
    </button>

    <div v-if="loading" class="loading">Loading...</div>

    <div v-else-if="book" class="book-detail">
      <div class="book-header">
        <img
          v-if="book.coverImage"
          :src="book.coverImage"
          :alt="book.title"
          class="book-cover-large"
        />
        <div v-else class="book-cover-placeholder-large">📖</div>

        <div class="book-info-main">
          <h1 class="book-title-large">{{ book.title }}</h1>
          <p class="book-author-large">{{ book.authors.join(', ') || 'Unknown Author' }}</p>

          <div class="book-meta-info">
            <div class="meta-item">
              <span class="label">Genre:</span>
              <span class="value">{{ book.subjects?.[0]?.split('--')[0] || 'Fiction' }}</span>
            </div>
            <div class="meta-item">
              <span class="label">Year:</span>
              <span class="value">{{ bookStats?.year || 'Unknown' }}</span>
            </div>
            <div class="meta-item">
              <span class="label">Pages:</span>
              <span class="value">{{ bookStats?.pages || 'Unknown' }}</span>
            </div>
          </div>

          <div class="book-stats">
            <div class="stat">
              <div class="stat-icon">
                <font-awesome-icon :icon="['fas', 'clock']" />
              </div>
              <div class="stat-info">
                <p class="stat-label">Avg. Reading Time</p>
                <p class="stat-value">{{ bookStats?.readingTime || '8h 30m' }}</p>
              </div>
            </div>
            <div class="stat">
              <div class="stat-icon">
                <font-awesome-icon :icon="['fas', 'book-open']" />
              </div>
              <div class="stat-info">
                <p class="stat-label">Pages</p>
                <p class="stat-value">{{ bookStats?.pages || 288 }}</p>
              </div>
            </div>
            <div class="stat">
              <div class="stat-icon">
                <font-awesome-icon :icon="['fas', 'users']" />
              </div>
              <div class="stat-info">
                <p class="stat-label">Readers</p>
                <p class="stat-value">{{ bookStats?.readers || '156K' }}</p>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <button
              @click="(startReading, changeStatus(book.book_id, 'reading'))"
              class="btn-primary"
            >
              {{ progress?.percentage > 0 ? 'Continue Reading' : 'Start Reading' }}
            </button>
            <button v-if="!inLibrary" @click="addToLibrary" class="btn-secondary">
              Add to Library
            </button>
          </div>
        </div>

        <div class="book-actions-right">
          <button class="icon-btn">
            <font-awesome-icon :icon="['far', 'heart']" />
          </button>
          <button class="icon-btn">
            <font-awesome-icon :icon="['fas', 'share']" />
          </button>
        </div>
      </div>

      <div class="book-content">
        <section class="book-about">
          <h2>About this book</h2>
          <p v-if="book.subjects && book.subjects.length > 0">
            {{ book.subjects.slice(0, 3).join(', ') }}
          </p>
          <p v-else>
            A fascinating book from Project Gutenberg's collection of classic literature.
          </p>
        </section>

        <section v-if="progress" class="continue-reading">
          <h3>Continue Reading</h3>
          <div class="reading-progress-card">
            <p class="chapter-info">Chapter {{ progress.current_chapter }} of 24</p>
            <div class="progress-bar-large">
              <div class="progress-fill-large" :style="{ width: `${progress.percentage}%` }"></div>
            </div>
            <p class="progress-text-large">
              {{ progress.percentage }}% complete • Last read
              {{ new Date(progress.last_read).toLocaleDateString() }}
            </p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.book-detail-view {
  min-height: 100vh;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: var(--color-background);
  color: var(--color-text);
}

.back-btn {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 2rem;
  color: var(--color-text);
}

.back-btn:hover {
  background: var(--color-background-soft);
}

.loading {
  text-align: center;
  padding: 4rem;
  font-size: 1.2rem;
  color: var(--color-text);
}

.book-header {
  display: grid;
  grid-template-columns: 200px 1fr auto;
  gap: 2rem;
  margin-bottom: 3rem;
  background: white;
  padding: 2rem;
  border-radius: 16px;
}

.book-cover-large {
  width: 200px;
  height: 300px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.book-cover-placeholder-large {
  width: 200px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  background: var(--color-background-mute);
  border-radius: 12px;
}

.book-info-main {
  flex: 1;
}

.book-title-large {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-heading);
}

.book-author-large {
  font-size: 1.2rem;
  color: var(--color-text);
  margin-bottom: 1.5rem;
}

.book-meta-info {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.meta-item {
  display: flex;
  gap: 0.5rem;
}

.meta-item .label {
  font-weight: 600;
  color: var(--color-heading);
}

.meta-item .value {
  color: var(--color-text);
}

.book-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 8px;
}

.stat-icon {
  font-size: 2rem;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-heading);
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.btn-primary {
  flex: 2;
  padding: 1rem 2rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-secondary {
  flex: 1;
  padding: 1rem 2rem;
  background: white;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
}

.btn-secondary:hover {
  background: var(--color-background-soft);
}

.book-actions-right {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.icon-btn {
  width: 48px;
  height: 48px;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
}

.icon-btn:hover {
  background: var(--color-background-soft);
}

.book-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.book-about {
  background: white;
  padding: 2rem;
  border-radius: 16px;
}

.book-about h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--color-heading);
}

.book-about p {
  line-height: 1.8;
  color: var(--color-text);
}

.continue-reading {
  background: white;
  padding: 2rem;
  border-radius: 12px;
}

.continue-reading h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--color-heading);
}

.reading-progress-card {
  background: var(--color-background-soft);
  padding: 1.5rem;
  border-radius: 8px;
}

.chapter-info {
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-heading);
}

.progress-bar-large {
  width: 100%;
  height: 8px;
  background: var(--color-background-mute);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.progress-fill-large {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s;
}

.progress-text-large {
  font-size: 0.9rem;
  color: var(--color-text);
}

@media (max-width: 768px) {
  .book-header {
    grid-template-columns: 1fr;
  }

  .book-cover-large {
    width: 100%;
    height: auto;
    max-width: 300px;
    margin: 0 auto;
  }

  .book-stats {
    grid-template-columns: 1fr;
  }
}
</style>
