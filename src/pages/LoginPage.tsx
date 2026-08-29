import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../lib/auth'
import { Lock, Mail } from 'lucide-react'
import { toast, Toaster } from 'sonner'

interface LoginPageProps {
  onLogin: () => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await login(email, password)

      if (result.success) {
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

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center p-4">
      <Toaster position="top-center" richColors />

      <div className="bg-[#FBF9F4] rounded-2xl p-8 w-full max-w-md shadow-xl border border-[#E8E2D5]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-[#1B2A4A]">🔐 LOFT Admin</h1>
          <p className="text-[#8A8275]">Войдите для доступа к панели управления</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#1B2A4A] mb-2 block">
              Email
            </label>
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-3.5 text-[#8A8275]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@loft-store.uz"
                className="w-full pl-10 pr-4 py-3 border border-[#E8E2D5] rounded-lg focus:outline-none focus:border-[#1B2A4A] bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#1B2A4A] mb-2 block">
              Пароль
            </label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-3.5 text-[#8A8275]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 border border-[#E8E2D5] rounded-lg focus:outline-none focus:border-[#1B2A4A] bg-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
              loading
                ? 'bg-[#8A8275] cursor-not-allowed'
                : 'bg-[#1B2A4A] hover:bg-[#142038]'
            }`}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-[#F5F1E8] rounded-lg border border-[#E8E2D5]">
          <p className="text-sm text-[#1B2A4A]">
            💡 <strong>Важно:</strong> Используйте email и пароль, которые были созданы в Supabase Dashboard → Authentication → Users
          </p>
        </div>
      </div>
    </div>
  )
}