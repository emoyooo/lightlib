<template>
  <div class="profile-page">
    <header class="topbar">
      <button class="back" @click="router.back()">←</button>
      <h1>Profile</h1>
      <div></div>
    </header>

    <section class="card user-card">
      <div class="avatar" :title="displayName">{{ initials }}</div>

      <div class="user-info">
        <div class="name-row">
          <template v-if="editing">
            <input v-model="nick" class="nick-input" maxlength="30" />
            <div class="edit-actions">
              <button class="btn save" @click="saveNick">Save</button>
              <button class="btn cancel" @click="cancelEdit">Cancel</button>
            </div>
          </template>

          <template v-else>
            <h2 class="nickname">{{ displayName }}</h2>
            <button class="btn edit" @click="startEdit">Edit</button>
          </template>
        </div>

        <p class="email">{{ emailDisplay }}</p>

        <div class="account-actions">
          <button class="btn logout" @click="logout">Sign out</button>
        </div>
      </div>
    </section>

    <section class="account-details card">
      <h3>Account</h3>
      <div class="row">
        <span class="label">Signed in as</span>
        <span class="value">{{ emailDisplay }}</span>
      </div>

      <div class="row">
        <span class="label">Nickname</span>
        <span class="value">{{ displayName }}</span>
      </div>
    </section>

    <footer class="bottom-nav">
      <button @click="router.push('/home')">🏠 Home</button>
      <button @click="router.push('/search')">🔍 Search</button>
      <button @click="router.push('/library')">📚 Library</button>
      <button class="active">👤 Profile</button>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// STORAGE KEY used for nickname fallback
const NICK_KEY = 'nickname'

// User sources: try authStore.user, fallback to localStorage
const rawUser = authStore?.user || (() => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
})()

const initialNick = (rawUser && (rawUser.nickname || rawUser.name)) || localStorage.getItem(NICK_KEY) || 'Reader'
const initialEmail = (rawUser && (rawUser.email)) || localStorage.getItem('email') || ''

const nick = ref(initialNick)
const editing = ref(false)

const displayName = computed(() => nick.value || 'Reader')
const emailDisplay = computed(() => initialEmail || 'No email')
const initials = computed(() => {
  const parts = (displayName.value || 'R').trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0,2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
})

// start editing
const startEdit = () => {
  nick.value = displayName.value
  editing.value = true
}

// cancel editing
const cancelEdit = () => {
  nick.value = displayName.value
  editing.value = false
}

// save nickname: update authStore if method exists, and localStorage
const saveNick = () => {
  const newNick = (nick.value || '').trim()
  if (!newNick) {
    alert('Nickname cannot be empty')
    return
  }

  // Update Pinia store if possible
  try {
    // common patterns: authStore.setUser, authStore.setNickname, authStore.updateUser, authStore.user = ...
    if (typeof authStore.setNickname === 'function') {
      authStore.setNickname(newNick)
    } else if (typeof authStore.updateUser === 'function') {
      const copy = { ...(authStore.user || {}), nickname: newNick }
      authStore.updateUser(copy)
    } else if (authStore.user) {
      // best-effort: mutate user object (Pinia reactive)
      authStore.user.nickname = newNick
    }
  } catch (err) {
    // ignore if store doesn't expose mutation helpers
    // we'll still persist to localStorage below
    // console.warn('Could not update authStore safely', err)
  }

  // Persist nickname in localStorage as fallback
  localStorage.setItem(NICK_KEY, newNick)

  // also, if user object exists in localStorage, update it for consistency
  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null')
    if (storedUser) {
      storedUser.nickname = newNick
      localStorage.setItem('user', JSON.stringify(storedUser))
    }
  } catch (e) {
    // ignore
  }

  editing.value = false
  // optional: notify other components if needed
  window.dispatchEvent(new Event('profile-updated'))
}

// logout: try store logout method, otherwise clear common keys and navigate to /login
const logout = () => {
  const ok = confirm('Sign out from this account?')
  if (!ok) return

  // If store provides logout, call it
  try {
    if (typeof authStore.logout === 'function') {
      authStore.logout()
    } else if (typeof authStore.clear === 'function') {
      authStore.clear()
    } else {
      // best-effort: remove common auth keys
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('nickname')
      localStorage.removeItem('email')
    }
  } catch (err) {
    // fallback: clear localStorage keys
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('nickname')
    localStorage.removeItem('email')
  }

  // optional: notify app about logout
  window.dispatchEvent(new Event('auth-logged-out'))

  // go to login
  router.push('/login')
}
</script>

<style scoped>
.profile-page {
  padding: 1.25rem;
  min-height: 100vh;
  background: #fff;
  font-family: 'Inter', system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  color: #111827;
  padding-bottom: 6rem; /* space for bottom nav */
}

.topbar {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:1rem;
  margin-bottom:1rem;
}
.topbar .back{
  background:none;border:none;font-size:1.05rem;cursor:pointer;color:#374151;
}
.topbar h1{font-size:1.1rem;margin:0;font-weight:600;color:#0d1b67}

.card { background: #fff; border-radius:10px; padding:1rem; box-shadow:0 1px 4px rgba(0,0,0,0.04); margin-bottom:1rem; }

.user-card {
  display:flex;
  gap:1rem;
  align-items:center;
  padding:1.2rem;
}

.avatar {
  width:72px;
  height:72px;
  border-radius:50%;
  background: linear-gradient(135deg,#3b82f6,#7c3aed);
  display:flex;
  align-items:center;
  justify-content:center;
  color: #fff;
  font-weight:700;
  font-size:1.2rem;
  box-shadow: 0 4px 14px rgba(12,18,60,0.06);
}

.user-info { flex:1; display:flex; flex-direction:column; gap:0.55rem; }

.name-row { display:flex; align-items:center; gap:0.6rem; }
.nickname { margin:0; font-size:1.15rem; font-weight:700; color:#0f172a; }
.btn { padding:0.45rem 0.6rem; border-radius:8px; border: none; cursor:pointer; font-weight:600; font-size:0.85rem; }
.btn.edit { background:#eef2ff; color:#3b82f6 }
.btn.save { background:#0d1b67; color:#fff }
.btn.cancel { background:#f3f4f6; color:#374151 }
.btn.logout { background:#fee2e2; color:#9b1238 }

.nick-input {
  padding:0.45rem 0.6rem;
  border-radius:8px;
  border:1px solid #e5e7eb;
  font-size:1rem;
  width: 240px;
}

.email { color:#6b7280; font-size:0.9rem; margin:0.2rem 0 0; }

.account-actions { margin-top:0.6rem; }

/* account details */
.account-details h3 { margin:0 0 0.6rem 0; color:#0d1b67; font-size:1rem }
.row { display:flex; justify-content:space-between; padding:0.45rem 0; border-top:1px dashed #f1f5f9 }
.row:first-of-type { border-top:none; }

/* bottom nav */
.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height:56px;
  background: #fff;
  border-top:1px solid #e6e6e6;
  display:flex;
  justify-content:space-around;
  align-items:center;
  padding: 0 1rem;
}
.bottom-nav button { background:none;border:none;font-size:1rem;cursor:pointer;color:#374151; }
.bottom-nav button.active { color:#0d1b67; font-weight:700; }
</style>
