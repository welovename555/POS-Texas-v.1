// scripts/state/userStore.js

let currentUser = null

export function restoreUserFromLocalStorage() {
  const saved = localStorage.getItem('user')
  if (saved) {
    try {
      currentUser = JSON.parse(saved)
      console.log('[userStore.js] Restored user session from localStorage:', currentUser)
    } catch (e) {
      console.error('[userStore.js] Failed to parse user from localStorage:', e)
      currentUser = null
    }
  } else {
    console.warn('[userStore.js] No user in localStorage')
    currentUser = null
  }
}

export function saveUserToLocalStorage(user) {
  currentUser = user
  localStorage.setItem('user', JSON.stringify(user))
  console.log('[userStore.js] Saved user to localStorage:', user)
}

export function getUser() {
  return currentUser
}

export function clearUser() {
  currentUser = null
  localStorage.removeItem('user')
  console.log('[userStore.js] Cleared user from localStorage')
}
