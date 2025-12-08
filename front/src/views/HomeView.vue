<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { booksAPI, libraryAPI, readingAPI } from '../services/api'
import { useAuthStore } from '../stores/auth'
import TopNavbar from '../components/TopNavbar.vue'

const router = useRouter()
const authStore = useAuthStore()

const featuredBooks = ref([])
const recommendedBooks = ref([])
const continueReading = ref([])
const libraryStats = ref({
  reading: 0,
  plan: 0,
  finished: 0,
  favorite: 0,
})
const loading = ref(false)

const fetchFeaturedBooks = async () => {
  try {
    const response = await booksAPI.getBooks(1, null, 'popular')
    featuredBooks.value = response.data.results.slice(0, 3)
  } catch (error) {
    console.error('Failed to fetch featured books:', error)
  }
}

const fetchRecommendedBooks = async () => {
  try {
    const response = await booksAPI.getBooks(1, 'fiction', 'popular')
    recommendedBooks.value = response.data.results.slice(0, 2)
  } catch (error) {
    console.error('Failed to fetch recommended books:', error)
  }
}

const fetchLibraryStats = async () => {
  if (!authStore.isAuthenticated) return

  try {
    const [readingRes, planRes, finishedRes, favoriteRes] = await Promise.all([
      libraryAPI.getLibrary('reading'),
      libraryAPI.getLibrary('plan'),
      libraryAPI.getLibrary('finished'),
      libraryAPI.getLibrary('favorite'),
    ])

    libraryStats.value = {
      reading: readingRes.data.length,
      plan: planRes.data.length,
      finished: finishedRes.data.length,
      favorite: favoriteRes.data.length,
    }

    // Get continue reading (books with progress)
    if (readingRes.data.length > 0) {
      const book = readingRes.data[0]
      const progressRes = await readingAPI.getProgress(book.book_id)
      continueReading.value = [
        {
          ...book,
          progress: progressRes.data,
        },
      ]
    }
  } catch (error) {
    console.error('Failed to fetch library stats:', error)
  }
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
    fetchLibraryStats()
  } catch (error) {
    alert(error.response?.data?.error || 'Failed to add book')
  }
}

const viewBookDetails = (bookId) => {
  router.push(`/book/${bookId}`)
}

const continueReadingBook = (bookId) => {
  router.push(`/read/${bookId}`)
}

const goToLibrarySection = (section) => {
  router.push({ name: 'library', query: { status: section } })
}

onMounted(async () => {
  loading.value = true
  await Promise.all([fetchFeaturedBooks(), fetchRecommendedBooks(), fetchLibraryStats()])
  loading.value = false
})
</script>

<template>
  <TopNavbar />
  <div class="home-view">
    <!-- Welcome Section -->
    <section class="welcome-section">
      <h1 class="welcome-title">
        Hello, {{ authStore.user?.nickname || authStore.user?.email || 'Reader' }}!
      </h1>
      <p class="welcome-subtitle">Ready to continue your reading journey?</p>
    </section>

    <div class="main-content">
      <!-- Featured This Week -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Featured This Week</h2>
          <div class="carousel-controls">
            <button class="carousel-btn">‹</button>
            <button class="carousel-btn">›</button>
          </div>
        </div>

        <div class="featured-grid">
          <div
            v-for="book in featuredBooks"
            :key="book.id"
            class="featured-card"
            @click="viewBookDetails(book.id)"
          >
            <div class="featured-image-container">
              <img
                v-if="book.coverImage"
                :src="book.coverImage"
                :alt="book.title"
                class="featured-image"
              />
              <div v-else class="featured-placeholder">📖</div>
              <span class="new-badge">NEW</span>
            </div>
            <div class="featured-info">
              <h3 class="featured-title">{{ book.title }}</h3>
              <p class="featured-author">{{ book.authors[0] || 'Unknown' }}</p>
              <div class="featured-meta">
                <span class="rating">⭐ 4.6</span>

                <span class="genre-tag">{{ book.subjects?.[0]?.split('--')[1] || 'Fiction' }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Your Library Stats -->
      <section v-if="authStore.isAuthenticated" class="section">
        <h2 class="section-title">Your Library</h2>

        <div class="library-stats">
          <div class="stat-card" @click="goToLibrarySection('reading')">
            <div class="stat-icon reading-icon" style="color: #0066d3">
              <font-awesome-icon :icon="['fas', 'book-open']" />
            </div>
            <div class="stat-info">
              <div class="stat-label">Reading Now</div>
              <div class="stat-value">{{ libraryStats.reading }}</div>
              <div class="stat-sublabel">books</div>
            </div>
          </div>

          <div class="stat-card" @click="goToLibrarySection('plan')">
            <div class="stat-icon plan-icon" style="color: #d3ba00">
              <font-awesome-icon :icon="['far', 'clock']" />
            </div>
            <div class="stat-info">
              <div class="stat-label">In Plans</div>
              <div class="stat-value">{{ libraryStats.plan }}</div>
              <div class="stat-sublabel">books</div>
            </div>
          </div>

          <div class="stat-card" @click="goToLibrarySection('finished')">
            <div class="stat-icon finished-icon" style="color: #428e47">
              <font-awesome-icon :icon="['fas', 'check']" />
            </div>
            <div class="stat-info">
              <div class="stat-label">Finished</div>
              <div class="stat-value">{{ libraryStats.finished }}</div>
              <div class="stat-sublabel">books</div>
            </div>
          </div>

          <div class="stat-card" @click="goToLibrarySection('favorite')">
            <div class="stat-icon favorite-icon" style="color: #8e424b">
              <font-awesome-icon :icon="['fas', 'heart']" />
            </div>
            <div class="stat-info">
              <div class="stat-label">Favorites</div>
              <div class="stat-value">{{ libraryStats.favorite }}</div>
              <div class="stat-sublabel">books</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Recommended for You -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Recommended for You</h2>
          <button class="see-all-btn">See all</button>
        </div>

        <div class="recommended-grid">
          <div v-for="book in recommendedBooks" :key="book.id" class="recommended-card">
            <div class="recommended-content" @click="viewBookDetails(book.id)">
              <img
                v-if="book.coverImage"
                :src="book.coverImage"
                :alt="book.title"
                class="recommended-image"
              />
              <div v-else class="recommended-placeholder">📖</div>

              <div class="recommended-info">
                <h3 class="recommended-title">{{ book.title }}</h3>
                <p class="recommended-author">{{ book.authors[0] || 'Unknown' }}</p>
                <div class="recommended-meta">
                  <span class="rating">⭐ 4.6</span>
                  <span class="genre-tag">{{
                    book.subjects?.[0]?.split('--')[1] || 'Romance'
                  }}</span>
                </div>
              </div>
            </div>

            <button @click="addToLibrary(book)" class="add-to-library-btn-horizontal">
              Add to Library
            </button>
          </div>
        </div>
      </section>

      <!-- Continue Reading -->
      <section v-if="authStore.isAuthenticated && continueReading.length > 0" class="section">
        <h2 class="section-title">Continue Reading</h2>

        <div v-for="book in continueReading" :key="book.book_id" class="continue-reading-card">
          <img
            v-if="book.cover_image"
            :src="book.cover_image"
            :alt="book.title"
            class="continue-reading-image"
          />
          <div v-else class="continue-reading-placeholder">📖</div>

          <div class="continue-reading-info">
            <h3 class="continue-reading-title">{{ book.title }}</h3>
            <p class="continue-reading-author">{{ book.author }}</p>

            <div class="progress-container">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: `${book.progress?.percentage || 0}%` }"
                ></div>
              </div>
              <p class="progress-text">
                {{ book.progress?.percentage || 0 }}% complete • Chapter
                {{ book.progress?.current_chapter || 1 }}
              </p>
            </div>

            <button @click="continueReadingBook(book.book_id)" class="continue-btn">
              Continue Reading
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
  background: var(--color-background, #f8f9fa);
  padding-bottom: 2rem;
}

/* Top Navigation */
.top-nav {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.nav-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
}

.discover-btn {
  padding: 0.75rem 1.5rem;
  background: white;
  color: #1a1a1a;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.discover-btn:hover {
  background: #f8f9fa;
}

/* Welcome Section */
.welcome-section {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.welcome-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.welcome-subtitle {
  color: #666;
  font-size: 1.1rem;
}

/* Main Content */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section {
  margin-bottom: 3rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
}

.carousel-controls {
  display: flex;
  gap: 0.5rem;
}

.carousel-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #e0e0e0;
  background: white;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.carousel-btn:hover {
  background: #f8f9fa;
}

.see-all-btn {
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  color: #04103c;
  font-weight: 600;
  cursor: pointer;
}

/* Featured Grid */
.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.featured-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e0e0e0;
}

.featured-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.featured-image-container {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.featured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.featured-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  font-size: 3rem;
}

.new-badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  background: #04103c;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
}

.featured-info {
  padding: 1rem;
}

.featured-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #1a1a1a;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.featured-author {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.featured-meta {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.rating {
  font-weight: 600;
  color: #1a1a1a;
}

.genre-tag {
  background: #f0f0f0;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  color: #666;
}

/* Library Stats */
.library-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  text-align: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}

.reading-icon {
  background: #e3f2fd;
}
.plan-icon {
  background: #fff9e6;
}
.finished-icon {
  background: #e8f5e9;
}
.favorite-icon {
  background: #fce4ec;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
}

.stat-sublabel {
  font-size: 0.85rem;
  color: #999;
}

/* Recommended Grid */
.recommended-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 1.5rem;
}

.recommended-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recommended-content {
  display: flex;
  gap: 1rem;
  cursor: pointer;
  flex: 1;
}

.recommended-image {
  width: 100px;
  height: 140px;
  object-fit: cover;
  border-radius: 8px;
}

.recommended-placeholder {
  width: 100px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 8px;
  font-size: 2rem;
}

.recommended-info {
  flex: 1;
}

.recommended-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #1a1a1a;
}

.recommended-author {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.recommended-meta {
  display: flex;
  gap: 0.75rem;
}

.add-to-library-btn-horizontal {
  width: 100%;
  padding: 0.875rem;
  background: #04103c;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-to-library-btn-horizontal:hover {
  background: #030c2e;
}

/* Continue Reading */
.continue-reading-card {
  background: #f0f4ff;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
}

.continue-reading-image {
  width: 100px;
  height: 140px;
  object-fit: cover;
  border-radius: 8px;
}

.continue-reading-placeholder {
  width: 100px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  font-size: 2rem;
}

.continue-reading-info {
  flex: 1;
}

.continue-reading-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #1a1a1a;
}

.continue-reading-author {
  color: #666;
  margin-bottom: 1rem;
}

.progress-container {
  margin-bottom: 1rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: #04103c;
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.9rem;
  color: #666;
}

.continue-btn {
  padding: 0.75rem 1.5rem;
  background: #04103c;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.continue-btn:hover {
  background: #030c2e;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-content {
    padding: 0;
  }

  .welcome-title {
    font-size: 1.5rem;
  }

  .featured-grid {
    grid-template-columns: 1fr;
  }

  .recommended-grid {
    grid-template-columns: 1fr;
  }

  .library-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .continue-reading-card {
    flex-direction: column;
  }

  .continue-reading-image,
  .continue-reading-placeholder {
    width: 100%;
    height: 200px;
  }
}
</style>
