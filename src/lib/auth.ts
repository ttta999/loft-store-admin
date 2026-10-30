import { supabase } from './supabase'

export const login = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    const { data: admin, error: roleError } = await supabase.rpc('store_is_admin')
    if (roleError || !admin) { await supabase.auth.signOut(); throw new Error('Нет доступа к админке') }
    return { success: true, user: data.user }
  } catch (error: any) {
    console.error('Ошибка входа:', error)
    return { 
      success: false, 
      error: error.message || 'Неверный email или пароль' 
    }
  }
}

export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    localStorage.removeItem('adminLoggedIn')
    return { success: true }
  } catch (error) {
    console.error('Ошибка выхода:', error)
    return { success: false }
  }
}

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    const { data: admin, error: roleError } = await supabase.rpc('store_is_admin')
    return !roleError && admin ? user : null
  } catch (error) {
    console.error('Ошибка получения пользователя:', error)
    return null
  }
}

export const requireAuth = async () => {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Требуется авторизация')
  }
  return user
}
