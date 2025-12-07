<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { booksAPI, readingAPI } from '../services/api'

const router = useRouter()
const route = useRoute()

const book = ref(null)
const content = ref('')
const loading = ref(true)
const currentPage = ref(1)
const totalPages = ref(24)
const currentChapter = ref(1)
const showSettings = ref(false)
const showBookmarks = ref(false)
const bookmarks = ref([])
const progressRestored = ref(false) // Track if progress was restored

const fontSize = ref(16)
const fontFamily = ref('serif')
const lineHeight = ref(1.8)
const backgroundColor = ref('#ffffff')

const pages = ref([])
const WORDS_PER_PAGE = 500

const currentContent = computed(() => {
  return pages.value[currentPage.value - 1] || ''
})

const progress = computed(() => {
  return Math.round((currentPage.value / totalPages.value) * 100)
})

const fetchBookContent = async () => {
  try {
    const [bookResponse, contentResponse] = await Promise.all([
      booksAPI.getBookById(route.params.id),
      booksAPI.getBookContent(route.params.id),
    ])

    book.value = bookResponse.data
    content.value = contentResponse.data.content

    splitIntoPages(content.value)

    // Fetch saved progress AFTER splitting pages
    try {
      const progressResponse = await readingAPI.getProgress(route.params.id)
      const savedProgress = progressResponse.data

      // Check if we have valid saved progress
      if (savedProgress && savedProgress.current_page > 0) {
        console.log('Restoring progress:', savedProgress)
        currentPage.value = savedProgress.current_page
        currentChapter.value = savedProgress.current_chapter || 1
        totalPages.value = savedProgress.total_pages || totalPages.value
        progressRestored.value = true

        // Hide banner after 5 seconds
        setTimeout(() => {
          progressRestored.value = false
        }, 5000)
      } else {
        console.log('No saved progress found, starting from page 1')
      }
    } catch (progressError) {
      console.log('No previous reading progress found')
      // This is fine - user is starting fresh
    }

    // Fetch bookmarks
    try {
      const bookmarksResponse = await readingAPI.getBookmarks(route.params.id)
      bookmarks.value = bookmarksResponse.data
    } catch (bookmarkError) {
      console.log('No bookmarks found')
      bookmarks.value = []
    }
  } catch (error) {
    console.error('Failed to fetch book content:', error)
    alert('Failed to load book content')
  } finally {
    loading.value = false
  }
}

const splitIntoPages = (text) => {
  const words = text.split(/\s+/)
  const tempPages = []

  for (let i = 0; i < words.length; i += WORDS_PER_PAGE) {
    const pageWords = words.slice(i, i + WORDS_PER_PAGE)
    tempPages.push(pageWords.join(' '))
  }

  pages.value = tempPages
  totalPages.value = tempPages.length
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    saveProgress()
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    saveProgress()
  }
}

const saveProgress = async () => {
  try {
    const progressData = {
      bookId: parseInt(route.params.id),
      currentPage: currentPage.value,
      totalPages: totalPages.value,
      currentChapter: currentChapter.value,
      percentage: progress.value,
    }

    console.log('Saving progress:', progressData)

    await readingAPI.updateProgress(progressData)

    console.log('Progress saved successfully')
  } catch (error) {
    console.error('Failed to save progress:', error)
    // Don't show alert - this happens automatically, shouldn't interrupt reading
  }
}

const addBookmark = async () => {
  const note = prompt('Add a note for this bookmark (optional):')

  try {
    const response = await readingAPI.addBookmark({
      bookId: parseInt(route.params.id),
      page: currentPage.value,
      chapter: currentChapter.value,
      note: note || '',
    })
    bookmarks.value.unshift(response.data)
    alert('Bookmark added!')
  } catch (error) {
    alert('Failed to add bookmark')
  }
}

const goToBookmark = (bookmark) => {
  currentPage.value = bookmark.page
  currentChapter.value = bookmark.chapter
  showBookmarks.value = false
}

const deleteBookmark = async (bookmarkId) => {
  if (!confirm('Delete this bookmark?')) return

  try {
    await readingAPI.deleteBookmark(bookmarkId)
    bookmarks.value = bookmarks.value.filter((b) => b._id !== bookmarkId)
  } catch (error) {
    alert('Failed to delete bookmark')
  }
}

const handleKeyPress = (event) => {
  if (event.key === 'ArrowRight') nextPage()
  if (event.key === 'ArrowLeft') previousPage()
}

watch([fontSize, fontFamily, lineHeight, backgroundColor], () => {
  localStorage.setItem(
    'readingSettings',
    JSON.stringify({
      fontSize: fontSize.value,
      fontFamily: fontFamily.value,
      lineHeight: lineHeight.value,
      backgroundColor: backgroundColor.value,
    }),
  )
})

onMounted(() => {
  fetchBookContent()

  const savedSettings = localStorage.getItem('readingSettings')
  if (savedSettings) {
    const settings = JSON.parse(savedSettings)
    fontSize.value = settings.fontSize
    fontFamily.value = settings.fontFamily
    lineHeight.value = settings.lineHeight
    backgroundColor.value = settings.backgroundColor
  }

  window.addEventListener('keydown', handleKeyPress)
})
</script>

<template>
  <div class="reading-view" :style="{ backgroundColor }">
    <header class="reading-header">
      <button @click="router.back()" class="header-btn" style="color: #86868696">
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
      </button>
      <div class="book-title-header">
        <h3>{{ book?.title || 'Loading...' }}</h3>
        <p class="author-header">{{ book?.authors?.[0] || '' }}</p>
      </div>
      <div class="header-actions">
        <button @click="showBookmarks = !showBookmarks" class="header-btn" style="color: #86868696">
          <font-awesome-icon :icon="['fas', 'bookmark']" />
        </button>
        <button @click="addBookmark" class="header-btn" style="color: #86868696">
          <font-awesome-icon :icon="['fas', 'plus']" />
        </button>
        <button @click="showSettings = !showSettings" class="header-btn" style="color: #86868696">
          <font-awesome-icon :icon="['fas', 'gear']" />
        </button>
      </div>
    </header>

    <div class="progress-bar-top">
      <div class="progress-fill-top" :style="{ width: `${progress}%` }"></div>
    </div>

    <div v-if="loading" class="loading">Loading book...</div>

    <div v-else class="reading-content">
      <div
        class="text-content"
        :style="{
          fontSize: `${fontSize}px`,
          fontFamily: fontFamily === 'serif' ? 'Georgia, serif' : 'Arial, sans-serif',
          lineHeight: lineHeight,
        }"
      >
        <p class="content-text">{{ currentContent }}</p>
      </div>
    </div>

    <footer class="reading-footer">
      <button @click="previousPage" :disabled="currentPage === 1" class="nav-btn">
        <font-awesome-icon :icon="['fas', 'arrow-left']" /> Previous
      </button>
      <div class="page-info">Page {{ currentPage }} of {{ totalPages }}</div>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="nav-btn">
        Next <font-awesome-icon :icon="['fas', 'arrow-right']" />
      </button>
    </footer>

    <!-- Settings Panel -->
    <div v-if="showSettings" class="settings-panel">
      <div class="panel-header">
        <h3>Reading Settings</h3>
        <button @click="showSettings = false" class="close-btn">✕</button>
      </div>

      <div class="setting-group">
        <label>Font Size: {{ fontSize }}px</label>
        <input v-model.number="fontSize" type="range" min="12" max="24" class="slider" />
      </div>

      <div class="setting-group">
        <label>Font Family</label>
        <select v-model="fontFamily" class="select">
          <option value="serif">Serif</option>
          <option value="sans-serif">Sans Serif</option>
        </select>
      </div>

      <div class="setting-group">
        <label>Line Height: {{ lineHeight }}</label>
        <input
          v-model.number="lineHeight"
          type="range"
          min="1.2"
          max="2.5"
          step="0.1"
          class="slider"
        />
      </div>

      <div class="setting-group">
        <label>Background Color</label>
        <div class="color-options">
          <button
            @click="backgroundColor = '#ffffff'"
            class="color-btn"
            :class="{ active: backgroundColor === '#ffffff' }"
            style="background: #ffffff; color: #000"
          >
            Light
          </button>
          <button
            @click="backgroundColor = '#f5f5dc'"
            class="color-btn"
            :class="{ active: backgroundColor === '#f5f5dc' }"
            style="background: #f5f5dc; color: #000"
          >
            Sepia
          </button>
          <button
            @click="backgroundColor = '#1a1a1a'"
            class="color-btn"
            :class="{ active: backgroundColor === '#1a1a1a' }"
            style="background: #1a1a1a; color: #fff"
          >
            Dark
          </button>
        </div>
      </div>
    </div>

    <!-- Bookmarks Panel -->
    <div v-if="showBookmarks" class="bookmarks-panel">
      <div class="panel-header">
        <h3>Bookmarks</h3>
        <button @click="showBookmarks = false" class="close-btn">✕</button>
      </div>

      <div v-if="bookmarks.length === 0" class="empty-bookmarks">
        <p>No bookmarks yet</p>
      </div>

      <div v-else class="bookmarks-list">
        <div v-for="bookmark in bookmarks" :key="bookmark._id" class="bookmark-item">
          <div @click="goToBookmark(bookmark)" class="bookmark-content">
            <p class="bookmark-page">Page {{ bookmark.page }} • Chapter {{ bookmark.chapter }}</p>
            <p v-if="bookmark.note" class="bookmark-note">{{ bookmark.note }}</p>
            <p class="bookmark-date">{{ new Date(bookmark.createdAt).toLocaleDateString() }}</p>
          </div>
          <button @click="deleteBookmark(bookmark._id)" class="delete-bookmark-btn">🗑️</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reading-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: background-color 0.3s;
}

.reading-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
}

.header-btn {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
}

.header-btn:hover {
  background: rgba(255, 255, 255, 1);
}

.book-title-header {
  flex: 1;
}

.book-title-header h3 {
  font-size: 1.1rem;
  margin: 0;
}

.author-header {
  font-size: 0.9rem;
  opacity: 0.7;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.progress-bar-top {
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
}

.progress-fill-top {
  height: 100%;
  background: hsla(160, 100%, 37%, 1);
  transition: width 0.3s;
}

.loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.reading-content {
  flex: 1;
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem 2rem;
  width: 100%;
}

.chapter-title {
  font-size: 1.8rem;
  margin-bottom: 2rem;
  text-align: center;
}

.content-text {
  text-align: justify;
  white-space: pre-wrap;
}

.reading-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
}

.nav-btn {
  padding: 0.75rem 1.5rem;
  background: hsla(160, 100%, 37%, 1);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.nav-btn:hover:not(:disabled) {
  background: hsla(160, 100%, 30%, 1);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-weight: 600;
  font-size: 1rem;
}

.settings-panel,
.bookmarks-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 350px;
  height: 100vh;
  background: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  overflow-y: auto;
  z-index: 100;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.panel-header h3 {
  font-size: 1.5rem;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  opacity: 0.7;
}

.close-btn:hover {
  opacity: 1;
}

.setting-group {
  margin-bottom: 2rem;
}

.setting-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #ddd;
  outline: none;
}

.slider::-webkit-slider-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: hsla(160, 100%, 37%, 1);
  cursor: pointer;
}

.select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.color-options {
  display: flex;
  gap: 0.5rem;
}

.color-btn {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.color-btn.active {
  border-color: hsla(160, 100%, 37%, 1);
}

.empty-bookmarks {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.bookmarks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bookmark-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.bookmark-content {
  flex: 1;
  cursor: pointer;
}

.bookmark-content:hover {
  opacity: 0.8;
}

.bookmark-page {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: hsla(160, 100%, 37%, 1);
}

.bookmark-note {
  margin-bottom: 0.5rem;
  color: #333;
}

.bookmark-date {
  font-size: 0.85rem;
  color: #999;
}

.delete-bookmark-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  opacity: 0.6;
}

.delete-bookmark-btn:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .settings-panel,
  .bookmarks-panel {
    width: 100%;
  }

  .reading-content {
    padding: 2rem 1rem;
  }
}
</style>
