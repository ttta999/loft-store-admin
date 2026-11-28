function sessionIdentifier(accessToken: string | undefined) {
  try {
    const payload = accessToken?.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/')
    const id: unknown = payload ? JSON.parse(atob(payload)).session_id : null
    return typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id) ? id : ''
  } catch { return '' }
}

function storedSessionIdentifier(value: string) {
  try { return sessionIdentifier(JSON.parse(value)?.access_token) } catch { return '' }
}

export function createAdminSessionBoundary(storageKey: string) {
  const epochKey = storageKey + ':logout'
  const sessionEpochKey = storageKey + ':epoch'
  const memory = new Map<string, string>()
  const read = (key: string) => {
    if (memory.has(key)) return memory.get(key) ?? null
    try { return localStorage.getItem(key) } catch { return null }
  }
  const write = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value)
      memory.delete(key)
    } catch { memory.set(key, value) }
  }
  const remove = (key: string) => {
    memory.delete(key)
    try { localStorage.removeItem(key) } catch { /* Storage can be disabled. */ }
  }
  let epoch = read(epochKey)
  const current = () => epoch === read(epochKey)
  const retired = new Set<string>()
  const rememberRevoked = () => {
    const id = read(epochKey)?.split(':')[1]
    if (id) retired.add(id)
  }
  rememberRevoked()
  return {
    current,
    acceptsToken: (accessToken: string) => current() && !retired.has(sessionIdentifier(accessToken)),
    storage: {
      getItem: (key: string) => current() && (key !== storageKey || read(sessionEpochKey) === epoch) ? read(key) : null,
      setItem: (key: string, value: string) => {
        if (!current()) return
        // A refresh already in flight can finish after an intentional new login.
        // Session identifiers here are local cache markers, never authorization.
        if (key === storageKey && retired.has(storedSessionIdentifier(value))) return
        write(key, value)
        if (key === storageKey && epoch) write(sessionEpochKey, epoch)
      },
      removeItem: (key: string) => { if (current()) remove(key) },
    },
    invalidate: (accessToken?: string) => {
      const invalidation = crypto.randomUUID() + ':' + sessionIdentifier(accessToken)
      write(epochKey, invalidation)
      rememberRevoked()
      for (const key of [storageKey, storageKey + '-code-verifier', storageKey + '-user', sessionEpochKey]) remove(key)
      if (memory.has(epochKey)) write(epochKey, invalidation)
    },
    resumeForLogin: () => {
      rememberRevoked()
      epoch = read(epochKey)
    },
    changedInAnotherTab: (event: StorageEvent) => event.key === epochKey && !current(),
  }
}
