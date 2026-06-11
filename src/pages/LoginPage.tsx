import { useState } from 'react'

interface LoginPageProps {
  onLogin: () => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD

    if (password === adminPassword) {
      localStorage.setItem('adminLoggedIn', 'true')
      onLogin()
    } else {
      setError('Неверный пароль')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">
          🔐 LOFT Admin
        </h1>
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              placeholder="Введите пароль"
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
              loading ? 'bg-gray-400' : 'bg-black hover:bg-gray-800'
            }`}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  )
}