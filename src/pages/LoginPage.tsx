import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../lib/auth'
import { Lock, Mail, Store, Info, Eye, EyeOff, Save, Check } from 'lucide-react'
import { toast, Toaster } from 'sonner'

interface LoginPageProps {
  onLogin: () => void
}

// ✅ Ключ кеша для запомненного email
const REMEMBER_EMAIL_KEY = 'loft_admin_remembered_email'

export default function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberEmail, setRememberEmail] = useState(true)
  const [loading, setLoading] = useState(false)

  // ✅ КЕШ: восстанавливаем запомненный email при открытии страницы
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_EMAIL_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.email) setEmail(parsed.email)
        if (typeof parsed.remember === 'boolean') setRememberEmail(parsed.remember)
      }
    } catch (error) {
      // Кеш повреждён — игнорируем
      localStorage.removeItem(REMEMBER_EMAIL_KEY)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await login(email, password)

      if (result.success) {
        // ✅ КЕШ: сохраняем или очищаем запомненный email
        try {
          if (rememberEmail) {
            localStorage.setItem(
              REMEMBER_EMAIL_KEY,
              JSON.stringify({ email: email.trim(), remember: true })
            )
          } else {
            localStorage.removeItem(REMEMBER_EMAIL_KEY)
          }
        } catch (error) {
          // localStorage недоступен — не критично
        }

        toast.success('Успешный вход!')
        onLogin()
        navigate('/')
      } else {
        toast.error(result.error || 'Неверный email или пароль')
      }
    } catch (error) {
      console.error('Ошибка входа:', error)
      toast.error('Ошибка при входе')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Имя из email для приветствия у поля пароля
  const emailName = email.trim() ? email.trim().split('@')[0] : ''

  return (
    <div className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg flex items-center justify-center p-4">
      <Toaster position="top-center" richColors />

      <div className="w-full max-w-md">
        {/* ✅ Шапка-карточка: лого + название (как шапка заказа) */}
        <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl p-4 border border-[#E8E2D5] dark:border-dark-border mb-3 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#1B2A4A] dark:bg-gold flex items-center justify-center flex-shrink-0">
            <Store size={22} className="text-white dark:text-[#1B2A4A]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-[#1B2A4A] dark:text-white truncate">
              LOFT Admin
            </h1>
            <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5 truncate">
              Панель управления магазином
            </p>
          </div>
        </div>

        {/* ✅ Карточка формы со строками-иконками */}
        <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border overflow-hidden mb-3">
          {/* Приветствие */}
          <div className="p-5 border-b border-[#E8E2D5] dark:border-dark-border">
            <h2 className="text-lg font-bold text-[#1B2A4A] dark:text-white">
              Добро пожаловать! 👋
            </h2>
            <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">
              Войдите для доступа к панели управления
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="divide-y divide-[#E8E2D5] dark:divide-dark-border">
              {/* ✅ Строка Email */}
              <div className="flex items-center gap-3 p-3.5">
                <div className="w-9 h-9 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
                  <Mail size={16} className="text-[#1B2A4A] dark:text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-xs text-[#8A8275] dark:text-gray-300 block mb-0.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@loft-store.uz"
                    className="w-full bg-transparent text-sm font-medium text-[#1B2A4A] dark:text-white focus:outline-none placeholder:text-[#8A8275] dark:placeholder:text-gray-500"
                    required
                  />
                </div>
              </div>

              {/* ✅ Строка Пароль + приветствие по имени из email */}
              <div className="flex items-center gap-3 p-3.5">
                <div className="w-9 h-9 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
                  <Lock size={16} className="text-[#1B2A4A] dark:text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-xs text-[#8A8275] dark:text-gray-300 block mb-0.5">
                    Пароль
                    {emailName && (
                      <span className="ml-1.5 text-[#C9A961] dark:text-gold font-bold">
                        · добро пожаловать, {emailName}! 👋
                      </span>
                    )}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="flex-1 bg-transparent text-sm font-medium text-[#1B2A4A] dark:text-white focus:outline-none placeholder:text-[#8A8275] dark:placeholder:text-gray-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                      className="p-1.5 rounded-lg text-[#8A8275] dark:text-gray-300 hover:bg-[#F5F1E8] dark:hover:bg-dark-accent transition-colors flex-shrink-0"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* ✅ Строка «Запомнить email» (кеш) */}
              <button
                type="button"
                onClick={() => setRememberEmail(!rememberEmail)}
                className="flex items-center gap-3 p-3.5 w-full text-left hover:bg-[#F5F1E8] dark:hover:bg-dark-accent transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
                  <Save size={16} className="text-[#1B2A4A] dark:text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1B2A4A] dark:text-white">
                    Запомнить email
                  </p>
                  <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">
                    В следующий раз email подставится автоматически
                  </p>
                </div>
                {/* Тумблер-кружок */}
                <span
                  className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                    rememberEmail
                      ? 'bg-[#1B2A4A] dark:bg-gold border-[#1B2A4A] dark:border-gold'
                      : 'bg-white dark:bg-dark-accent border-[#E8E2D5] dark:border-dark-border'
                  }`}
                >
                  {rememberEmail && (
                    <Check size={14} className="text-white dark:text-[#1B2A4A]" />
                  )}
                </span>
              </button>
            </div>

            {/* ✅ Кнопка входа */}
            <div className="p-3 border-t border-[#E8E2D5] dark:border-dark-border bg-[#F5F1E8]/60 dark:bg-dark-accent/40">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                  loading
                    ? 'bg-[#E8E2D5] dark:bg-dark-accent text-[#8A8275] dark:text-gray-500 cursor-not-allowed'
                    : 'bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A] hover:bg-[#142038] dark:hover:bg-[#d6b57e]'
                }`}
              >
                <Lock size={16} />
                {loading ? 'Вход...' : 'Войти'}
              </button>
            </div>
          </form>
        </div>

        {/* ✅ Инфо-примечание (как на странице заказа) */}
        <div className="flex items-center gap-3 p-4 bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border rounded-2xl">
          <div className="w-9 h-9 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
            <Info size={16} className="text-[#1B2A4A] dark:text-white" />
          </div>
          <p className="text-xs text-[#8A8275] dark:text-gray-300 leading-relaxed">
            Используйте email и пароль, созданные в Supabase Dashboard → Authentication → Users
          </p>
        </div>
      </div>
    </div>
  )
}