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
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B2A4A] mx-auto mb-4"></div>
          <p className="text-[#1B2A4A]">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <Toaster position="top-center" richColors />
      <div className="bg-[#FBF9F4] border-b border-[#E8E2D5] p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[#1B2A4A] hover:text-[#C9A961] mb-4"
          >
            <ArrowLeft size={20} />
            <span>На главную</span>
          </button>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">⚙️ Настройки</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* РЕЖИМ СКИДОК */}
        <div className="bg-[#FBF9F4] rounded-xl p-6 shadow-sm border border-[#E8E2D5] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Tag size={24} className="text-[#9B3B3B]" />
            <h2 className="text-xl font-bold text-[#1B2A4A]">Режим скидок</h2>
          </div>

          <div className="bg-[#9B3B3B]/10 border border-[#9B3B3B]/20 rounded-lg p-4 mb-4">
            <p className="text-sm text-[#9B3B3B]">
              💡 Когда режим ВКЛЮЧЁН: товары со скидочной ценой показываются в приложении
              с перечёркнутой старой ценой, и на главной появляется бокс «💰 Скидки».
            </p>
            <p className="text-xs text-[#9B3B3B]/80 mt-1">
              🔄 Когда режим ВЫКЛЮЧЕН: все цены обычные, бокс «Скидки» скрыт.
            </p>
          </div>

          <div className="flex items-center justify-between p-4 border border-[#E8E2D5] rounded-lg bg-white">
            <div>
              <p className="font-medium text-[#1B2A4A]">Режим скидок в приложении</p>
              <p className={`text-sm mt-1 ${saleMode ? 'text-[#1B2A4A]' : 'text-[#1B2A4A]'}`}>
                {saleMode ? '✅ Включён — скидки активны' : '⛔ Выключен — скидки скрыты'}
              </p>
            </div>
            <button
              onClick={handleToggleSaleMode}
              disabled={savingSaleMode}
              className={`px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 ${
                saleMode
                  ? 'bg-[#9B3B3B] text-white hover:bg-[#7a2f2f]'
                  : 'bg-[#1B2A4A] text-white hover:bg-[#142038]'
              }`}
            >
              {savingSaleMode ? 'Сохранение...' : (saleMode ? 'Выключить' : 'Включить')}
            </button>
          </div>
        </div>

        {/* Курс валют */}
        <div className="bg-[#FBF9F4] rounded-xl p-6 shadow-sm border border-[#E8E2D5] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign size={24} className="text-[#C9A961]" />
            <h2 className="text-xl font-bold text-[#1B2A4A]">Курс валют</h2>
          </div>

          <div className="bg-[#1B2A4A]/5 border border-[#1B2A4A]/10 rounded-lg p-4 mb-4">
            <p className="text-sm text-[#1B2A4A]">
              💡 Этот курс используется для отображения цен в сумах в основном приложении.
            </p>
            <p className="text-xs text-[#1B2A4A] mt-1">
              🔄 Приложение проверяет обновления каждые 5 минут
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#1B2A4A] mb-2 block">
                Курс USD к UZS
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(Number(e.target.value))}
                  className="flex-1 p-3 border border-[#E8E2D5] rounded-lg focus:outline-none focus:border-[#1B2A4A] text-lg font-bold bg-white text-[#1B2A4A]"
                  step="0.01"
                  min="0"
                />
                <span className="flex items-center px-4 bg-[#E8E2D5] rounded-lg text-[#1B2A4A] font-medium">
                  сум
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={handleFetchFromAPI}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1B2A4A] text-white rounded-lg font-medium hover:bg-[#142038] transition-colors disabled:opacity-50"
              >
                <RefreshCw size={20} className={saving ? 'animate-spin' : ''} />
                Получить актуальный курс
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#C9A961] text-white rounded-lg font-medium hover:bg-[#b8954f] transition-colors disabled:opacity-50"
              >
                <Save size={20} />
                Сохранить изменения
              </button>
            </div>

            {lastUpdated && (
              <div className="text-sm text-[#1B2A4A] pt-2 border-t border-[#E8E2D5]">
                <p>📅 Последнее обновление: {lastUpdated}</p>
                <p>👤 Обновлено: {updatedBy === 'admin' ? 'Менеджером' : 'Автоматически'}</p>
                <p>🔢 Версия курса: {currentVersion}</p>
              </div>
            )}
          </div>
        </div>

        {/* Информация */}
        <div className="bg-[#FBF9F4] rounded-xl p-6 shadow-sm border border-[#E8E2D5]">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp size={24} className="text-[#C9A961]" />
            <h2 className="text-xl font-bold text-[#1B2A4A]">Информация</h2>
          </div>
          <div className="space-y-3 text-sm text-[#1B2A4A]">
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