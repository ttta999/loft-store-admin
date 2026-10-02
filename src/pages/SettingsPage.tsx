import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  ArrowLeft,
  Save,
  RefreshCw,
  DollarSign,
  Info,
  Tag,
  Settings as SettingsIcon,
  Truck,
} from 'lucide-react'
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

  // ✅ Цена доставки в сумах (0 = бесплатно)
  const [deliveryPrice, setDeliveryPrice] = useState<number>(0)
  const [savingDelivery, setSavingDelivery] = useState(false)

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

      if (!error && data) {
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

      // ✅ Загружаем цену доставки
      const { data: deliveryData, error: deliveryError } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'delivery_price')
        .single()

      if (!deliveryError && deliveryData) {
        const price = (deliveryData.value as any)?.price
        setDeliveryPrice(typeof price === 'number' && price >= 0 ? price : 0)
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

  // ✅ Сохранение цены доставки
  const handleSaveDelivery = async () => {
    if (deliveryPrice < 0) {
      toast.error('Цена доставки не может быть отрицательной')
      return
    }
    setSavingDelivery(true)
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'delivery_price',
          value: {
            price: deliveryPrice,
            updated_by: 'admin',
            updated_at: new Date().toISOString(),
            version: Date.now()
          },
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        })

      if (error) throw error

      toast.success(deliveryPrice > 0
        ? `🚚 Цена доставки сохранена: ${deliveryPrice.toLocaleString('ru-RU')} сум`
        : '🚚 Доставка теперь БЕСПЛАТНАЯ')
    } catch (error) {
      console.error('Ошибка сохранения цены доставки:', error)
      toast.error('Ошибка сохранения')
    }
    setSavingDelivery(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="bg-[#FBF9F4] rounded-2xl border border-[#E8E2D5] p-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B2A4A] mx-auto mb-4"></div>
          <p className="text-[#1B2A4A] font-medium">Загрузка настроек...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <Toaster position="top-center" richColors />

      {/* ✅ Sticky-шапка (десктоп): назад слева, заголовок справа */}
      <div className="sticky top-0 z-20 bg-[#F5F1E8]/95 backdrop-blur-sm border-b border-[#E8E2D5] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 text-sm font-bold text-[#1B2A4A] hover:text-[#C9A961] transition-colors"
          >
            <span className="w-10 h-10 rounded-full bg-[#FBF9F4] border border-[#E8E2D5] flex items-center justify-center">
              <ArrowLeft size={18} />
            </span>
            На главную
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1B2A4A]">Настройки</h1>
            <span className="w-10 h-10 rounded-full bg-[#FBF9F4] border border-[#E8E2D5] flex items-center justify-center">
              <SettingsIcon size={18} className="text-[#1B2A4A]" />
            </span>
          </div>
        </div>
      </div>

      {/* ✅ Двухколоночная сетка секций (десктоп) */}
      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* ========== РЕЖИМ СКИДОК ========== */}
        <div className="bg-[#FBF9F4] rounded-2xl border border-[#E8E2D5] overflow-hidden">
          {/* Шапка секции */}
          <div className="flex items-center gap-3 p-5 border-b border-[#E8E2D5]">
            <div className="w-11 h-11 rounded-full bg-[#F5F1E8] border border-[#E8E2D5] flex items-center justify-center flex-shrink-0">
              <Tag size={20} className="text-[#9B3B3B]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#1B2A4A]">Режим скидок</h2>
              <p className="text-xs text-[#8A8275] mt-0.5">
                Переключатель видимости скидок в приложении
              </p>
            </div>
          </div>

          {/* Инфо-плашка */}
          <div className="p-5 pb-0">
            <div className="flex items-start gap-3 p-4 bg-[#9B3B3B]/5 border border-[#9B3B3B]/15 rounded-xl">
              <div className="w-9 h-9 rounded-full bg-[#9B3B3B]/10 flex items-center justify-center flex-shrink-0">
                <Info size={16} className="text-[#9B3B3B]" />
              </div>
              <div className="text-xs text-[#9B3B3B] leading-relaxed">
                <p><b>Включён:</b> товары со скидкой показываются с перечёркнутой старой ценой, бокс «💰 Скидки» виден на главной.</p>
                <p className="mt-1"><b>Выключен:</b> все цены обычные, бокс скидок скрыт.</p>
              </div>
            </div>
          </div>

          {/* Строка состояния + кнопка (лейбл слева, контрол справа) */}
          <div className="p-5 flex items-center justify-between gap-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#F5F1E8] border border-[#E8E2D5] flex items-center justify-center flex-shrink-0">
                <span className="text-lg">{saleMode ? '✅' : '⛔'}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#1B2A4A]">
                  {saleMode ? 'Скидки включены' : 'Скидки выключены'}
                </p>
                <p className="text-xs text-[#8A8275] mt-0.5">
                  {saleMode ? 'Клиенты видят скидочные цены' : 'Клиенты видят обычные цены'}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleSaleMode}
              disabled={savingSaleMode}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex-shrink-0 ${
                saleMode
                  ? 'bg-[#9B3B3B] text-white hover:bg-[#7a2f2f]'
                  : 'bg-[#1B2A4A] text-white hover:bg-[#142038]'
              }`}
            >
              {savingSaleMode ? 'Сохранение...' : (saleMode ? 'Выключить' : 'Включить')}
            </button>
          </div>
        </div>

        {/* ========== ДОСТАВКА ========== */}
        <div className="bg-[#FBF9F4] rounded-2xl border border-[#E8E2D5] overflow-hidden">
          {/* Шапка секции */}
          <div className="flex items-center gap-3 p-5 border-b border-[#E8E2D5]">
            <div className="w-11 h-11 rounded-full bg-[#F5F1E8] border border-[#E8E2D5] flex items-center justify-center flex-shrink-0">
              <Truck size={20} className="text-[#1B2A4A]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#1B2A4A]">Доставка</h2>
              <p className="text-xs text-[#8A8275] mt-0.5">
                Цена доставки в приложении при выборе «Доставка»
              </p>
            </div>
          </div>

          {/* Инфо-плашка */}
          <div className="p-5 pb-0">
            <div className="flex items-start gap-3 p-4 bg-[#1B2A4A]/5 border border-[#1B2A4A]/10 rounded-xl">
              <div className="w-9 h-9 rounded-full bg-[#1B2A4A]/10 flex items-center justify-center flex-shrink-0">
                <Info size={16} className="text-[#1B2A4A]" />
              </div>
              <div className="text-xs text-[#1B2A4A] leading-relaxed">
                <p>Эта сумма добавляется к итогу заказа, когда клиент выбирает «Доставка».</p>
                <p className="mt-1">Укажите <b>0</b> — и доставка будет <b>бесплатной</b> (в корзине напишется «Бесплатно»).</p>
              </div>
            </div>
          </div>

          {/* Строка ввода: лейбл слева, контрол справа */}
          <div className="p-5 flex items-center justify-between gap-6">
            <div className="min-w-0">
              <label className="text-sm font-bold text-[#1B2A4A] block">
                Цена доставки (сум)
              </label>
              <p className="text-xs text-[#8A8275] mt-0.5">
                {deliveryPrice > 0
                  ? `Сейчас: ${deliveryPrice.toLocaleString('ru-RU')} сум за доставку`
                  : 'Сейчас: доставка бесплатная'}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <input
                type="number"
                value={deliveryPrice}
                onChange={(e) => setDeliveryPrice(Math.max(0, Number(e.target.value) || 0))}
                className="w-40 px-4 py-3 border border-[#E8E2D5] rounded-xl focus:outline-none focus:border-[#1B2A4A] text-base font-bold bg-white text-[#1B2A4A] text-right"
                step="1000"
                min="0"
              />
              <span className="px-4 py-3 bg-[#E8E2D5] rounded-xl text-[#1B2A4A] text-sm font-bold">
                сум
              </span>
            </div>
          </div>

          {/* Кнопка сохранить */}
          <div className="px-5 pb-5">
            <button
              onClick={handleSaveDelivery}
              disabled={savingDelivery}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1B2A4A] text-white rounded-xl font-bold hover:bg-[#142038] transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              {savingDelivery ? 'Сохранение...' : 'Сохранить цену доставки'}
            </button>
          </div>
        </div>

        {/* ========== КУРС ВАЛЮТ ========== */}
        <div className="bg-[#FBF9F4] rounded-2xl border border-[#E8E2D5] overflow-hidden lg:col-span-2">
          {/* Шапка секции */}
          <div className="flex items-center gap-3 p-5 border-b border-[#E8E2D5]">
            <div className="w-11 h-11 rounded-full bg-[#F5F1E8] border border-[#E8E2D5] flex items-center justify-center flex-shrink-0">
              <DollarSign size={20} className="text-[#C9A961]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#1B2A4A]">Курс валют</h2>
              <p className="text-xs text-[#8A8275] mt-0.5">
                USD → UZS, используется для отображения цен в сумах
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-5">
            {/* Левая колонка: ввод курса */}
            <div>
              <div className="flex items-center justify-between gap-6 p-4 bg-[#F5F1E8]/60 border border-[#E8E2D5] rounded-xl">
                <div className="min-w-0">
                  <label className="text-sm font-bold text-[#1B2A4A] block">
                    Курс USD к UZS
                  </label>
                  <p className="text-xs text-[#8A8275] mt-0.5">
                    Фиксируется в каждом заказе
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <input
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                    className="w-36 px-4 py-3 border border-[#E8E2D5] rounded-xl focus:outline-none focus:border-[#1B2A4A] text-base font-bold bg-white text-[#1B2A4A] text-right"
                    step="0.01"
                    min="0"
                  />
                  <span className="px-4 py-3 bg-[#E8E2D5] rounded-xl text-[#1B2A4A] text-sm font-bold">
                    сум
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <button
                  onClick={handleFetchFromAPI}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-[#E8E2D5] text-[#1B2A4A] rounded-xl font-bold hover:bg-[#F5F1E8] transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={18} className={saving ? 'animate-spin' : ''} />
                  Получить курс
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#C9A961] text-white rounded-xl font-bold hover:bg-[#b8954f] transition-colors disabled:opacity-50"
                >
                  <Save size={18} />
                  Сохранить курс
                </button>
              </div>
            </div>

            {/* Правая колонка: информация об обновлении */}
            <div className="bg-[#F5F1E8]/60 border border-[#E8E2D5] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-[#FBF9F4] border border-[#E8E2D5] flex items-center justify-center flex-shrink-0">
                  <span className="text-base">📋</span>
                </div>
                <p className="text-sm font-bold text-[#1B2A4A]">Последнее обновление</p>
              </div>
              {lastUpdated ? (
                <div className="space-y-2 text-xs text-[#8A8275]">
                  <p className="flex justify-between gap-4">
                    <span>📅 Дата:</span>
                    <span className="font-bold text-[#1B2A4A] text-right">{lastUpdated}</span>
                  </p>
                  <p className="flex justify-between gap-4">
                    <span>👤 Кем:</span>
                    <span className="font-bold text-[#1B2A4A]">{updatedBy === 'admin' ? 'Менеджером' : 'Автоматически'}</span>
                  </p>
                  <p className="flex justify-between gap-4">
                    <span>🔢 Версия:</span>
                    <span className="font-bold text-[#1B2A4A]">{currentVersion}</span>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#8A8275]">Курс ещё не обновлялся вручную</p>
              )}
            </div>
          </div>
        </div>

        {/* ========== ИНФОРМАЦИЯ ========== */}
        <div className="bg-[#FBF9F4] rounded-2xl border border-[#E8E2D5] overflow-hidden lg:col-span-2">
          {/* Шапка секции */}
          <div className="flex items-center gap-3 p-5 border-b border-[#E8E2D5]">
            <div className="w-11 h-11 rounded-full bg-[#F5F1E8] border border-[#E8E2D5] flex items-center justify-center flex-shrink-0">
              <Info size={20} className="text-[#1B2A4A]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#1B2A4A]">Как это работает</h2>
              <p className="text-xs text-[#8A8275] mt-0.5">
                Справка по настройкам приложения и админки
              </p>
            </div>
          </div>

          {/* Двухколоночный список строк-иконок */}
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-8">
            {[
              { icon: '💱', text: 'Курс используется для конвертации цен из USD в UZS' },
              { icon: '🔒', text: 'При оформлении заказа курс фиксируется и сохраняется' },
              { icon: '👤', text: 'Клиенты видят цены в сумах по текущему курсу' },
              { icon: '📚', text: 'Исторические заказы хранят курс на момент оформления' },
              { icon: '🔄', text: 'Приложение проверяет обновления курса каждые 5 минут' },
              { icon: '⚡', text: 'При изменении курса в админке приложение обновит его автоматически' },
              { icon: '🏷️', text: 'Режим скидок включает/выключает скидки во всём приложении' },
              { icon: '💰', text: 'Скидочная цена задаётся в карточке товара («Цена со скидкой»)' },
              { icon: '🚚', text: 'Цена доставки добавляется к итогу при выборе «Доставка»' },
              { icon: '🆓', text: 'При самовывозе доставка всегда бесплатная' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 py-3 border-b border-[#E8E2D5] last:border-0 md:[&:nth-last-child(2)]:border-0">
                <div className="w-9 h-9 rounded-full bg-[#F5F1E8] border border-[#E8E2D5] flex items-center justify-center flex-shrink-0">
                  <span className="text-base">{item.icon}</span>
                </div>
                <p className="flex-1 text-sm text-[#1B2A4A] pt-1.5">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}