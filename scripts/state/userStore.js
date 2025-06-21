// scripts/state/userStore.js

let user = null;

export function setUser(userData) {
  user = userData;
  localStorage.setItem('user', JSON.stringify(userData));
  console.log('[userStore] Set user:', userData);
}

export function getUser() {
  if (!user) {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        user = JSON.parse(storedUser);
        console.log('[userStore] Restored user session from localStorage:', user);
      } catch (e) {
        console.error('[userStore] Failed to parse stored user:', e);
      }
    } else {
      console.warn('[userStore] No user in localStorage');
    }
  }
  return user;
}

export function clearUser() {
  user = null;
  localStorage.removeItem('user');
  console.log('[userStore] Cleared user');
}
