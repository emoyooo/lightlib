<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { libraryAPI, achievementAPI } from '../services/api'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('overview')
const stats = ref({
  booksRead: 0,
  dayStreak: 0,
  hoursRead: 0,
  pagesRead: 0,
  monthlyGoal: 4,
  monthlyProgress: 0,
})

const achievements = ref([])
const loading = ref(false)

const fetchStats = async () => {
  loading.value = true
  try {
    // Try to fetch achievement stats first
    try {
      const statsRes = await achievementAPI.getStats()
      const achievementStats = statsRes.data.data

      stats.value.booksRead = achievementStats.books_read || 0
      stats.value.dayStreak = achievementStats.streak || 0
      stats.value.pagesRead = achievementStats.pages_read || 0
      stats.value.hoursRead = Math.floor(achievementStats.pages_read / 50) || 0

      // Calculate monthly progress (cap at monthly goal)
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()

      const finishedRes = await libraryAPI.getLibrary('finished')
      const monthlyBooks = finishedRes.data.filter((book) => {
        const addedDate = new Date(book.added_at)
        return addedDate.getMonth() === currentMonth && addedDate.getFullYear() === currentYear
      }).length

      stats.value.monthlyProgress = Math.min(monthlyBooks, stats.value.monthlyGoal)
    } catch (apiError) {
      console.error('Achievement API not available, using fallback:', apiError)

      // Fallback to library data only
      const finishedRes = await libraryAPI.getLibrary('finished')
      stats.value.booksRead = finishedRes.data.length

      // Calculate monthly progress
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()

      const monthlyBooks = finishedRes.data.filter((book) => {
        const addedDate = new Date(book.added_at)
        return addedDate.getMonth() === currentMonth && addedDate.getFullYear() === currentYear
      }).length

      stats.value.monthlyProgress = Math.min(monthlyBooks, stats.value.monthlyGoal)
      stats.value.dayStreak = 0
      stats.value.hoursRead = 0
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  } finally {
    loading.value = false
  }
}

const fetchAchievements = async () => {
  try {
    const response = await achievementAPI.getAchievements()
    achievements.value = response.data.data
    console.log('Achievements loaded:', achievements.value)
  } catch (error) {
    console.error('Failed to fetch achievements:', error)
    console.error('Error details:', error.response?.data || error.message)
    // Set empty array as fallback
    achievements.value = []
  }
}

const monthlyGoalPercentage = computed(() => {
  return Math.min((stats.value.monthlyProgress / stats.value.monthlyGoal) * 100, 100)
})

const earnedAchievements = computed(() => {
  return achievements.value.filter((a) => a.earned)
})

const inProgressAchievements = computed(() => {
  return achievements.value.filter((a) => !a.earned)
})

const handleLogout = () => {
  if (confirm('Are you sure you want to logout?')) {
    authStore.logout()
    router.push('/login')
  }
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
  } else {
    fetchStats()
    fetchAchievements()
  }
})
</script>

<template>
  <div class="profile-view">
    <!-- Header -->
    <div class="profile-header">
      <button @click="router.back()" class="back-btn">
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
        Profile
      </button>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        @click="activeTab = 'overview'"
        :class="['tab', { active: activeTab === 'overview' }]"
      >
        Overview
      </button>
      <button
        @click="activeTab = 'achievements'"
        :class="['tab', { active: activeTab === 'achievements' }]"
      >
        Achievements
      </button>
      <button
        @click="activeTab = 'settings'"
        :class="['tab', { active: activeTab === 'settings' }]"
      >
        Settings
      </button>
    </div>

    <div class="profile-content">
      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="tab-content">
        <!-- Profile Info Card -->
        <div class="profile-card">
          <div class="profile-avatar">
            {{ (authStore.user?.nickname || authStore.user?.email || 'U')[0].toUpperCase() }}
          </div>

          <div class="profile-info">
            <h2 class="profile-name">{{ authStore.user?.nickname || 'Reader' }}</h2>
            <p class="profile-email">{{ authStore.user?.email }}</p>

            <div class="profile-stats">
              <div class="stat">
                <div class="stat-value">{{ stats.booksRead }}</div>
                <div class="stat-label">Books Read</div>
              </div>
              <div class="stat">
                <div class="stat-value stat-green">{{ stats.dayStreak }}</div>
                <div class="stat-label">Day Streak</div>
              </div>
              <div class="stat">
                <div class="stat-value stat-purple">{{ stats.hoursRead }}h</div>
                <div class="stat-label">Hours Read</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Monthly Reading Goal -->
        <div class="goal-card">
          <div class="goal-header">
            <span class="goal-icon" style="color: #8e424b">
              <font-awesome-icon :icon="['fas', 'crosshairs']" />
            </span>
            <h3>Monthly Reading Goal</h3>
          </div>

          <div class="goal-progress-info">
            <span class="goal-text"
              >{{ stats.monthlyProgress }} of {{ stats.monthlyGoal }} books</span
            >
            <span class="goal-percentage">{{ Math.round(monthlyGoalPercentage) }}% complete</span>
          </div>

          <div class="progress-bar-large">
            <div class="progress-fill-large" :style="{ width: `${monthlyGoalPercentage}%` }"></div>
          </div>

          <p class="goal-message">
            You're doing great! Just {{ stats.monthlyGoal - stats.monthlyProgress }} more book{{
              stats.monthlyGoal - stats.monthlyProgress !== 1 ? 's' : ''
            }}
            to reach your goal.
          </p>
        </div>
      </div>

      <!-- Achievements Tab -->
      <div v-if="activeTab === 'achievements'" class="tab-content">
        <div v-if="loading" class="loading">Loading achievements...</div>

        <div v-else>
          <div class="achievements-header">
            <h2 class="achievements-title">Your Achievements</h2>
            <p class="achievements-subtitle">
              {{ earnedAchievements.length }} of {{ achievements.length }} earned
            </p>
          </div>

          <!-- Earned Achievements -->
          <div v-if="earnedAchievements.length > 0" class="achievement-section">
            <h3 class="section-title">🏆 Earned</h3>
            <div class="achievements-grid">
              <div
                v-for="achievement in earnedAchievements"
                :key="achievement.id"
                class="achievement-card earned"
                :style="{ background: achievement.bgColor }"
              >
                <div class="achievement-icon">{{ achievement.icon }}</div>
                <div class="achievement-info">
                  <h3 class="achievement-title">{{ achievement.title }}</h3>
                  <p class="achievement-description">{{ achievement.description }}</p>
                  <span class="earned-badge">Earned!</span>
                </div>
              </div>
            </div>
          </div>

          <!-- In Progress Achievements -->
          <div v-if="inProgressAchievements.length > 0" class="achievement-section">
            <h3 class="section-title">📈 In Progress</h3>
            <div class="achievements-grid">
              <div
                v-for="achievement in inProgressAchievements"
                :key="achievement.id"
                class="achievement-card"
                :style="{ background: achievement.bgColor }"
              >
                <div class="achievement-icon">{{ achievement.icon }}</div>
                <div class="achievement-info">
                  <h3 class="achievement-title">{{ achievement.title }}</h3>
                  <p class="achievement-description">{{ achievement.description }}</p>

                  <div class="achievement-progress">
                    <div class="progress-bar-small">
                      <div
                        class="progress-fill-small"
                        :style="{ width: `${achievement.progress}%` }"
                      ></div>
                    </div>
                    <span class="progress-text-small">
                      {{ achievement.currentValue }} / {{ achievement.target }} ({{
                        achievement.progress
                      }}% complete)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings Tab -->
      <div v-if="activeTab === 'settings'" class="tab-content">
        <h2 class="settings-title">Settings</h2>

        <div class="settings-section">
          <h3>Account</h3>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">Email</div>
              <div class="setting-value">{{ authStore.user?.email }}</div>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">Nickname</div>
              <div class="setting-value">{{ authStore.user?.nickname || 'Not set' }}</div>
            </div>
            <button class="setting-btn">Edit</button>
          </div>
        </div>

        <div class="settings-section">
          <h3>Reading Goals</h3>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">Monthly Goal</div>
              <div class="setting-value">{{ stats.monthlyGoal }} books</div>
            </div>
            <button class="setting-btn">Change</button>
          </div>
        </div>

        <div class="settings-section">
          <h3>Account Actions</h3>
          <button @click="handleLogout" class="logout-btn">Logout</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 2rem;
}

.profile-header {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tabs {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  gap: 1rem;
  border-bottom: 2px solid #e0e0e0;
}

.tab {
  padding: 1rem 2rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: #666;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.tab.active {
  color: #1a1a1a;
  border-bottom-color: #04103c;
}

.profile-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.tab-content {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
}

/* Profile Card */
.profile-card {
  background: linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  align-items: flex-start;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #04103c;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
  position: relative;
  flex-shrink: 0;
}

.profile-name {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.profile-email {
  color: #666;
  margin-bottom: 1.5rem;
}

.profile-stats {
  display: flex;
  gap: 3rem;
}

.stat {
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #04103c;
}

.stat-value.stat-green {
  color: #10b981;
}

.stat-value.stat-purple {
  color: #8b5cf6;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.25rem;
}

/* Goal Card */
.goal-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.goal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.goal-icon {
  font-size: 1.5rem;
}

.goal-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
}

.goal-progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.goal-text {
  font-weight: 600;
}

.goal-percentage {
  color: #666;
}

.progress-bar-large {
  width: 100%;
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill-large {
  height: 100%;
  background: #04103c;
  transition: width 0.3s;
}

.goal-message {
  color: #666;
  font-size: 0.95rem;
}

/* Achievements */
.achievements-header {
  margin-bottom: 2rem;
}

.achievements-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.achievements-subtitle {
  color: #666;
  font-size: 1rem;
}

.achievement-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.achievement-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.achievement-card.earned {
  border-color: #fbbf24;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
}

.achievement-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.achievement-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
}

.achievement-info {
  flex: 1;
}

.achievement-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.achievement-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.achievement-progress {
  margin-top: 0.75rem;
}

.progress-bar-small {
  width: 100%;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill-small {
  height: 100%;
  background: #04103c;
  transition: width 0.3s;
}

.progress-text-small {
  font-size: 0.85rem;
  color: #666;
}

.earned-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #fbbf24;
  color: white;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

/* Settings */
.settings-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
}

.settings-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 1.5rem;
}

.settings-section h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.setting-value {
  color: #666;
  font-size: 0.9rem;
}

.setting-btn {
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.logout-btn {
  width: 100%;
  padding: 1rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #b91c1c;
}

@media (max-width: 768px) {
  .profile-card {
    flex-direction: column;
    text-align: center;
  }

  .profile-stats {
    justify-content: center;
  }

  .achievements-grid {
    grid-template-columns: 1fr;
  }
}
</style>
