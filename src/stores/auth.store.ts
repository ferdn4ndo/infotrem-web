import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import * as AuthApi from '@/services/api/auth.api'
import { setAuthTokenProvider } from '@/services/http/api-client'
import type { CurrentUser, LoginPayload, RegisterPayload } from '@/types/domain/user.type'

const tokenStorageKey = 'infotrem.authToken'

function readStoredToken() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(tokenStorageKey)
}

function persistToken(token: string | null) {
  if (typeof window === 'undefined') {
    return
  }

  if (token) {
    window.localStorage.setItem(tokenStorageKey, token)
  } else {
    window.localStorage.removeItem(tokenStorageKey)
  }
}

function extractToken(response: Record<string, unknown>) {
  return (
    response.token ??
    response.key ??
    response.auth_token ??
    response.access_token ??
    response.user_token
  )?.toString()
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(readStoredToken())
  const user = ref<CurrentUser | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)

  setAuthTokenProvider(() => token.value)

  const isLoggedIn = computed(() => Boolean(token.value))
  const isStaff = computed(() => Boolean(user.value?.is_staff || user.value?.is_admin))
  const isAdmin = computed(() => Boolean(user.value?.is_admin))
  const displayName = computed(
    () =>
      user.value?.name?.toString() ||
      user.value?.username?.toString() ||
      user.value?.email?.toString() ||
      'Visitante'
  )

  function setToken(nextToken: string | null) {
    token.value = nextToken
    persistToken(nextToken)
  }

  async function refreshMe() {
    if (!token.value) {
      user.value = null
      return null
    }

    user.value = await AuthApi.me()
    return user.value
  }

  async function login(payload: LoginPayload) {
    isLoading.value = true
    errorMessage.value = null

    try {
      const response = await AuthApi.login(payload)
      const nextToken = extractToken(response)

      if (!nextToken) {
        throw new Error('Login response did not include a token.')
      }

      setToken(nextToken)
      await refreshMe()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Login failed.'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function register(payload: RegisterPayload) {
    isLoading.value = true
    errorMessage.value = null

    try {
      await AuthApi.register(payload)
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Registration failed.'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    setToken(null)
    user.value = null
  }

  return {
    token,
    user,
    isLoading,
    errorMessage,
    isLoggedIn,
    isStaff,
    isAdmin,
    displayName,
    login,
    register,
    logout,
    refreshMe,
    setToken
  }
})
