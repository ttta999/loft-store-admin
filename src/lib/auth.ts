import { detachAdminSession, isAdminSessionCurrent, prepareAdminLogin, supabase } from './supabase'

export interface MfaStep {
  factorId: string
}

type LoginResult = { success: true; mfa?: MfaStep } | { success: false; error: string }

async function prepareSecondFactor(): Promise<MfaStep | undefined> {
  const { data: state, error: stateError } = await supabase.rpc('store_admin_auth_state')
  if (stateError || state?.isAdmin !== true) {
    await supabase.auth.signOut()
    throw new Error('Нет доступа к админке')
  }
  const { data: factors, error: factorError } = await supabase.auth.mfa.listFactors()
  if (factorError) throw new Error('Не удалось проверить второй фактор. Повторите вход.')
  const verified = factors.totp.find(factor => factor.status === 'verified')
  const { data: assurance, error: assuranceError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (assuranceError) throw new Error('Не удалось проверить второй фактор. Повторите вход.')
  const approved = state.factorId
    ? factors.totp.find(factor => factor.id === state.factorId && factor.status === 'verified')
    : verified
  if (!approved) {
    await logout()
    throw new Error('Нет доступа к админке')
  }
  if (assurance.currentLevel === 'aal2') {
    const { data: allowed, error } = await supabase.rpc('store_is_admin')
    if (!error && allowed === true) return undefined
  }
  return { factorId: approved.id }
}

export const login = async (email: string, password: string): Promise<LoginResult> => {
  try {
    prepareAdminLogin()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !isAdminSessionCurrent()) return { success: false, error: 'Неверный email или пароль' }
    const mfa = await prepareSecondFactor()
    if (mfa) return { success: true, mfa }
    const { data: allowed, error: roleError } = await supabase.rpc('store_is_admin')
    if (roleError || allowed !== true) throw new Error('Нет доступа к админке')
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Неверный email или пароль' }
  }
}

export const verifySecondFactor = async (factorId: string, code: string) => {
  if (!/^\d{6}$/.test(code)) throw new Error('Введите шестизначный код из приложения-аутентификатора')
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code })
  if (error) throw new Error('Код не подошёл. Проверьте код и попробуйте ещё раз.')
  const { data: admin, error: roleError } = await supabase.rpc('store_is_admin')
  if (roleError || admin !== true) throw new Error('Нет доступа к админке')
}

let pendingToken: string | null = null
let logoutAttempt: Promise<{ success: boolean }> | null = null
export const canRetryLogout = () => pendingToken !== null

export const retryLogout = () => {
  if (logoutAttempt) return logoutAttempt
  if (!pendingToken) return Promise.resolve({ success: false })
  const token = pendingToken
  logoutAttempt = Promise.resolve().then(async () => {
    try {
      const { error } = await supabase.auth.admin.signOut(token, 'local')
      if (error) {
        if (error.status === 401 && pendingToken === token) pendingToken = null
        return { success: false }
      }
      if (pendingToken === token) pendingToken = null
      return { success: true }
    } catch {
      return { success: false }
    } finally {
      logoutAttempt = null
    }
  })
  return logoutAttempt
}

export const logout = () => {
  if (logoutAttempt) return logoutAttempt
  const token = detachAdminSession()
  if (token) pendingToken = token
  try { localStorage.removeItem('adminLoggedIn') } catch { /* Storage can be disabled. */ }
  return retryLogout()
}

export const getCurrentUser = async () => {
  try {
    if (!isAdminSessionCurrent()) return null
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    const { data: admin, error: roleError } = await supabase.rpc('store_is_admin')
    return isAdminSessionCurrent() && !roleError && admin === true ? user : null
  } catch { return null }
}

export const requireAuth = async () => {
  const user = await getCurrentUser()
  if (!user) throw new Error('Требуется авторизация')
  return user
}
