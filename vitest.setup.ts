// Ensures a working Web Storage API in the test environment.
//
// Under newer Node versions, jsdom can run on an opaque origin (or with the
// experimental web storage disabled), leaving `window.localStorage` undefined
// or throwing on access. Component specs that boot the auth store / theme
// composable then crash. We install a deterministic in-memory Storage when a
// usable one is not already present.

class MemoryStorage implements Storage {
  private store = new Map<string, string>()

  get length(): number {
    return this.store.size
  }

  clear(): void {
    this.store.clear()
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value))
  }
}

function hasUsableStorage(target: { localStorage?: unknown }): boolean {
  try {
    const candidate = target.localStorage as Storage | undefined
    return Boolean(candidate) && typeof candidate?.getItem === 'function'
  } catch {
    return false
  }
}

function ensureLocalStorage(target: object): void {
  if (hasUsableStorage(target as { localStorage?: unknown })) {
    return
  }

  Object.defineProperty(target, 'localStorage', {
    configurable: true,
    writable: true,
    value: new MemoryStorage()
  })
}

if (typeof globalThis !== 'undefined') {
  ensureLocalStorage(globalThis)
}

if (typeof window !== 'undefined') {
  ensureLocalStorage(window)
}
