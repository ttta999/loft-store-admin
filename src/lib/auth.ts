import { supabase } from './supabase'

export const login = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
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
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user || null
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