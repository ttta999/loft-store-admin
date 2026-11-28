import test from 'node:test'
import assert from 'node:assert/strict'
import { createAdminSessionBoundary } from '../src/lib/adminSessionBoundary.ts'

test('a local logout removes only auth state and fences writes from existing tabs', () => {
  const values = new Map<string, string>([['theme', 'dark'], ['language', 'uz']])
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
    removeItem: (key: string) => { values.delete(key) },
  } })
  try {
    const key = 'fixture-auth'
    const first = createAdminSessionBoundary(key)
    const second = createAdminSessionBoundary(key)
    const jwt = (id: string) => '.' + btoa(JSON.stringify({ session_id: id })) + '.'
    const oldToken = jwt('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')
    const newToken = jwt('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')
    const oldSession = JSON.stringify({ access_token: oldToken })
    const newSession = JSON.stringify({ access_token: newToken })
    first.storage.setItem(key, oldSession)
    assert.equal(second.storage.getItem(key), oldSession)
    first.invalidate(oldToken)
    assert.equal(second.current(), false)
    second.storage.setItem(key, 'late-fixture-refresh')
    assert.equal(values.has(key), false)
    const reloaded = createAdminSessionBoundary(key)
    assert.equal(reloaded.storage.getItem(key), null)
    first.resumeForLogin()
    first.storage.setItem(key, newSession)
    first.storage.setItem(key, oldSession)
    assert.equal(first.acceptsToken(oldToken), false)
    second.storage.removeItem(key)
    assert.equal(reloaded.storage.getItem(key), newSession)
    assert.equal(values.get('theme'), 'dark')
    assert.equal(values.get('language'), 'uz')
  } finally {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous)
    else Reflect.deleteProperty(globalThis, 'localStorage')
  }
})
