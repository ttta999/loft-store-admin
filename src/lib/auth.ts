import { supabase } from './supabase'

export interface MfaStep {
  factorId: string
  qrCode?: string
  secret?: string
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
  if (!state.mfaRequired && !verified) return undefined
  if (verified && assurance.currentLevel === 'aal2') {
    const { data: allowed, error } = await supabase.rpc('store_is_admin')
    if (!error && allowed === true) return undefined
  }
  if (verified) return { factorId: verified.id }
  // Only abandoned, unverified enrollments created by this form may be replaced.
  // Verified factors are never removed by the application.
  for (const factor of factors.all.filter(factor => factor.status === 'unverified' && factor.friendly_name === 'LOFT Admin')) {
    const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id })
    if (error) throw new Error('Не удалось начать настройку второго фактора. Повторите вход.')
  }
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'LOFT Admin', issuer: 'LOFT Admin' })
  if (error) throw new Error('Не удалось начать настройку второго фактора. Повторите вход.')
  return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret }
}

export const login = async (email: string, password: string): Promise<LoginResult> => {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { success: false, error: 'Неверный email или пароль' }
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

export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    localStorage.removeItem('adminLoggedIn')
    return { success: true }
  } catch { return { success: false } }
}

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    const { data: admin, error: roleError } = await supabase.rpc('store_is_admin')
    return !roleError && admin === true ? user : null
  } catch { return null }
}

export const requireAuth = async () => {
  const user = await getCurrentUser()
  if (!user) throw new Error('Требуется авторизация')
  return user
}
