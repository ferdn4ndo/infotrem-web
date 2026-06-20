import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import * as AuthApi from '@/services/api/auth.api'
import { setAuthTokenProvider } from '@/services/http/api-client'
import type {
  CurrentUser,
  LoginPayload,
  ProfileUpdatePayload,
  RegisterPayload
} from '@/types/domain/user.type'

const tokenStorageKey = 'infotrem.authToken'

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage ?? null
  } catch {
    // Accessing localStorage can throw (opaque origins, privacy mode).
    return null
  }
}

function readStoredToken() {
  try {
    return getLocalStorage()?.getItem(tokenStorageKey) ?? null
  } catch {
    return null
  }
}

function persistToken(token: string | null) {
  const storage = getLocalStorage()
  if (!storage) {
    return
  }

  try {
    if (token) {
      storage.setItem(tokenStorageKey, token)
    } else {
      storage.removeItem(tokenStorageKey)
    }
  } catch {
    // Persistence is best-effort; ignore storage failures.
  }
}

function extractToken(response: Record<string, unknown>) {
  const tokenCandidate =
    response.token ??
    response.key ??
    response.auth_token ??
    response.access_token ??
    response.user_token

  if (tokenCandidate === null || tokenCandidate === undefined || tokenCandidate === '') {
    console.warn('[auth.store] Authentication response did not include a recognized token field.', {
      keys: Object.keys(response)
    })
    return null
  }

  return tokenCandidate.toString()
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
      errorMessage.value = error instanceof Error ? error.message : 'Não foi possível entrar.'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function register(payload: RegisterPayload) {
    isLoading.value = true
    errorMessage.value = null

    try {
      const response = await AuthApi.register(payload)
      const nextToken = extractToken(response)

      if (nextToken) {
        setToken(nextToken)
        await refreshMe()
      }
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'Não foi possível concluir o cadastro.'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function updateProfile(payload: Partial<ProfileUpdatePayload>) {
    isLoading.value = true
    errorMessage.value = null

    try {
      user.value = await AuthApi.updateMe(payload)
      return user.value
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'Não foi possível atualizar o perfil.'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function resendEmailValidation() {
    isLoading.value = true
    errorMessage.value = null

    try {
      return await AuthApi.resendEmailValidation()
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'Não foi possível reenviar a validação de e-mail.'
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
    updateProfile,
    resendEmailValidation,
    logout,
    refreshMe,
    setToken
  }
})
