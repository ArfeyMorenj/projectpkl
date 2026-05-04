'use client'

const DEMO_MODE_KEY = 'fitart_demo_mode'
const DEMO_STORAGE_KEY = 'fitart_demo_store_v1'
const DEMO_TOKEN_KEY = 'auth_token'
const DEMO_USER_KEY = 'auth_user'

export function clearDemoSession() {
  if (typeof window === 'undefined') return

  window.localStorage.removeItem(DEMO_MODE_KEY)
  window.localStorage.removeItem(DEMO_STORAGE_KEY)
  window.localStorage.removeItem(DEMO_TOKEN_KEY)
  window.localStorage.removeItem(DEMO_USER_KEY)
}
