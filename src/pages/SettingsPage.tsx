import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Save, RefreshCw, DollarSign, TrendingUp, Tag } from 'lucide-react'
import { toast, Toaster } from 'sonner'

export default function SettingsPage() {
  const navigate = useNavigate()
  const [exchangeRate, setExchangeRate] = useState<number>(12100)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [updatedBy, setUpdatedBy] = useState<string>('system')
  const [currentVersion, setCurrentVersion] = useState<number>(0)

  // ✅ РЕЖИМ СКИДОК
  const [saleMode, setSaleMode] = useState(false)
  const [savingSaleMode, setSavingSaleMode] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'exchange_rate')
        .single()

      if (error) throw error

      if (data) {
        setExchangeRate((data.value as any)?.rate || 12100)
        setUpdatedBy((data.value as any)?.updated_by || 'system')
        setCurrentVersion((data.value as any)?.version || 0)
        setLastUpdated(data.updated_at ? new Date(data.updated_at).toLocaleString('ru-RU') : '')
      }

      // ✅ Загружаем режим скидок
      const { data: saleData, error: saleError } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'sale_mode_enabled')
        .single()

      if (!saleError && saleData) {
        setSaleMode(Boolean((saleData.value as any)?.enabled))
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error)
      toast.error('Ошибка загрузки настроек')
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!exchangeRate || exchangeRate <= 0) {
      toast.error('Введите корректный курс')
      return
    }

    setSaving(true)
    try {
      const newVersion = Date.now()

      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'exchange_rate',
          value: {
            rate: exchangeRate,
            updated_by: 'admin',
            updated_at: new Date().toISOString(),
            version: newVersion
          },
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        })

      if (error) throw error

      setCurrentVersion(newVersion)
      toast.success(`Курс успешно обновлён! (версия: ${newVersion})`)
      await loadSettings()
    } catch (error) {
      console.error('Ошибка сохранения:', error)
      toast.error('Ошибка сохранения')
    }
    setSaving(false)
  }

  const handleFetchFromAPI = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/getExchangeRate')
      const data = await response.json()

      if (data.success && data.rate) {
        setExchangeRate(data.rate)
        toast.success(`Курс получен: ${data.rate} (${data.source})`)
      } else {
        toast.error(`Ошибка: ${data.error || 'Не удалось получить курс'}`)
      }
    } catch (error) {
      console.error('Ошибка получения курса:', error)
      toast.error('Ошибка получения курса')
    }
    setSaving(false)
  }

  // ✅ ПЕРЕКЛЮЧЕНИЕ РЕЖИМА СКИДОК
  const handleToggleSaleMode = async () => {
    setSavingSaleMode(true)
    try {
      const newValue = !saleMode

      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'sale_mode_enabled',
          value: {
            enabled: newValue,
            updated_by: 'admin',
            updated_at: new Date().toISOString(),
            version: Date.now()
          },
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        })

      if (error) throw error

      setSaleMode(newValue)
      toast.success(newValue
        ? '🏷️ Режим скидок ВКЛЮЧЁН — скидки видны в приложении'
        : '🏷️ Режим скидок ВЫКЛЮЧЕН — цены обычные')
    } catch (error) {
      console.error('Ошибка переключения режима скидок:', error)
      toast.error('Ошибка сохранения')
    }
    setSavingSaleMode(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-500">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-center" richColors />
      <div className="bg-white border-b p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-4"
          >
            <ArrowLeft size={20} />
            <span>На главную</span>
          </button>
          <h1 className="text-2xl font-bold">️ Настройки</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* ✅ РЕЖИМ СКИДОК */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Tag size={24} className="text-red-500" />
            <h2 className="text-xl font-bold">Режим скидок</h2>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800">
              💡 Когда режим ВКЛЮЧЁН: товары со скидочной ценой показываются в приложении
              с перечёркнутой старой ценой, и на главной появляется бокс «💰 Скидки».
            </p>
            <p className="text-xs text-red-600 mt-1">
              🔄 Когда режим ВЫКЛЮЧЕН: все цены обычные, бокс «Скидки» скрыт.
            </p>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium">Режим скидок в приложении</p>
              <p className={`text-sm mt-1 ${saleMode ? 'text-green-600' : 'text-gray-500'}`}>
                {saleMode ? '✅ Включён — скидки активны' : '⛔ Выключен — скидки скрыты'}
              </p>
            </div>
            <button
              onClick={handleToggleSaleMode}
              disabled={savingSaleMode}
              className={`px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 ${
                saleMode
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {savingSaleMode ? 'Сохранение...' : (saleMode ? 'Выключить' : 'Включить')}
            </button>
          </div>
        </div>

        {/* Курс валют */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign size={24} className="text-green-600" />
            <h2 className="text-xl font-bold">Курс валют</h2>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              💡 Этот курс используется для отображения цен в сумах в основном приложении.
            </p>
            <p className="text-xs text-blue-600 mt-1">
              🔄 Приложение проверяет обновления каждые 5 минут
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Курс USD к UZS
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(Number(e.target.value))}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-lg font-bold"
                  step="0.01"
                  min="0"
                />
                <span className="flex items-center px-4 bg-gray-100 rounded-lg text-gray-600 font-medium">
                  сум
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={handleFetchFromAPI}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={20} className={saving ? 'animate-spin' : ''} />
                Получить актуальный курс
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <Save size={20} />
                Сохранить изменения
              </button>
            </div>

            {lastUpdated && (
              <div className="text-sm text-gray-500 pt-2 border-t">
                <p>📅 Последнее обновление: {lastUpdated}</p>
                <p>👤 Обновлено: {updatedBy === 'admin' ? 'Менеджером' : 'Автоматически'}</p>
                <p>🔢 Версия курса: {currentVersion}</p>
              </div>
            )}
          </div>
        </div>

        {/* Информация */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp size={24} className="text-purple-600" />
            <h2 className="text-xl font-bold">Информация</h2>
          </div>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong>Как это работает:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Курс используется для конвертации цен из USD в UZS</li>
              <li>При оформлении заказа курс фиксируется и сохраняется</li>
              <li>Клиенты видят цены в сумах по текущему курсу</li>
              <li>Исторические заказы сохраняют курс на момент оформления</li>
              <li>✅ Приложение проверяет обновления курса каждые 5 минут</li>
              <li>✅ При изменении курса в админке, приложение обновит его автоматически</li>
              <li>🏷️ Режим скидок включает/выключает скидки во всём приложении</li>
              <li>🏷️ Скидочная цена задаётся в карточке товара («Цена со скидкой»)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}