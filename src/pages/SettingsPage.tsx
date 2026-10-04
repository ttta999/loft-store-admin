import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../lib/theme'
import {
  ArrowLeft,
  Save,
  RefreshCw,
  DollarSign,
  Info,
  Tag,
  Settings as SettingsIcon,
  Truck,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react'
import { toast, Toaster } from 'sonner'

// ✅ Module-level кеш настроек: переживает размонтирование страницы
interface SettingsCacheData {
  exchangeRate: number
  saleMode: boolean
  deliveryPrice: number
  lastUpdated: string
  updatedBy: string
  currentVersion: number
  timestamp: number
}

let settingsCache: SettingsCacheData | null = null
const SETTINGS_CACHE_TTL = 5 * 60 * 1000 // 5 минут

const getSettingsCache = (): SettingsCacheData | null => {
  if (!settingsCache) return null
  if (Date.now() - settingsCache.timestamp > SETTINGS_CACHE_TTL) {
    settingsCache = null
    return null
  }
  return settingsCache
}

const setSettingsCache = (data: Omit<SettingsCacheData, 'timestamp'>) => {
  settingsCache = { ...data, timestamp: Date.now() }
}

const invalidateSettingsCache = () => {
  settingsCache = null
}

// ✅ Маленькая круглая кнопка «i» — раскрывает пояснение к секции
function InfoToggle({ open, onClick, title }: { open: boolean; onClick: () => void; title: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
        open
          ? 'bg-[#1B2A4A] dark:bg-gold border-[#1B2A4A] dark:border-gold text-white dark:text-[#1B2A4A]'
          : 'bg-[#F5F1E8] dark:bg-dark-accent border-[#E8E2D5] dark:border-dark-border text-[#8A8275] dark:text-gray-300 hover:text-[#1B2A4A] dark:hover:text-gold'
      }`}
    >
      <Info size={14} />
    </button>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

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

  // ✅ Раскрываемые пояснения (скрыты по умолчанию)
  const [showThemeInfo, setShowThemeInfo] = useState(false)
  const [showSaleInfo, setShowSaleInfo] = useState(false)
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    // ✅ Проверяем кеш
    const cached = getSettingsCache()
    if (cached) {
      setExchangeRate(cached.exchangeRate)
      setSaleMode(cached.saleMode)
      setDeliveryPrice(cached.deliveryPrice)
      setLastUpdated(cached.lastUpdated)
      setUpdatedBy(cached.updatedBy)
      setCurrentVersion(cached.currentVersion)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      let rate = 12100
      let updBy = 'system'
      let version = 0
      let updAt = ''
      let sale = false
      let delivery = 0

      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'exchange_rate')
        .single()

      if (!error && data) {
        rate = (data.value as any)?.rate || 12100
        updBy = (data.value as any)?.updated_by || 'system'
        version = (data.value as any)?.version || 0
        updAt = data.updated_at ? new Date(data.updated_at).toLocaleString('ru-RU') : ''
      }

      const { data: saleData, error: saleError } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'sale_mode_enabled')
        .single()

      if (!saleError && saleData) {
        sale = Boolean((saleData.value as any)?.enabled)
      }

      // ✅ Загружаем цену доставки
      const { data: deliveryData, error: deliveryError } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'delivery_price')
        .single()

      if (!deliveryError && deliveryData) {
        const price = (deliveryData.value as any)?.price
        delivery = typeof price === 'number' && price >= 0 ? price : 0
      }

      setExchangeRate(rate)
      setUpdatedBy(updBy)
      setCurrentVersion(version)
      setLastUpdated(updAt)
      setSaleMode(sale)
      setDeliveryPrice(delivery)

      // ✅ Сохраняем в кеш
      setSettingsCache({
        exchangeRate: rate,
        saleMode: sale,
        deliveryPrice: delivery,
        lastUpdated: updAt,
        updatedBy: updBy,
        currentVersion: version,
      })
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
      setUpdatedBy('admin')
      const newLastUpdated = new Date().toLocaleString('ru-RU')
      setLastUpdated(newLastUpdated)

      // ✅ Обновляем кеш
      setSettingsCache({
        exchangeRate,
        saleMode,
        deliveryPrice,
        lastUpdated: newLastUpdated,
        updatedBy: 'admin',
        currentVersion: newVersion,
      })

      toast.success(`Курс успешно обновлён! (версия: ${newVersion})`)
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

      // ✅ Обновляем кеш
      setSettingsCache({
        exchangeRate,
        saleMode: newValue,
        deliveryPrice,
        lastUpdated,
        updatedBy,
        currentVersion,
      })

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

      // ✅ Обновляем кеш
      setSettingsCache({
        exchangeRate,
        saleMode,
        deliveryPrice,
        lastUpdated,
        updatedBy,
        currentVersion,
      })

      toast.success(deliveryPrice > 0
        ? `🚚 Цена доставки сохранена: ${deliveryPrice.toLocaleString('ru-RU')} сум`
        : '🚚 Доставка теперь БЕСПЛАТНАЯ')
    } catch (error) {
      console.error('Ошибка сохранения цены доставки:', error)
      toast.error('Ошибка сохранения')
    }
    setSavingDelivery(false)
  }

  const handleRefresh = () => {
    invalidateSettingsCache()
    loadSettings()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg flex items-center justify-center">
        <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B2A4A] dark:border-gold mx-auto mb-4"></div>
          <p className="text-[#1B2A4A] dark:text-white font-medium">Загрузка настроек...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg">
      {/* ✅ Тосты в текущей теме (system следует за ОС) */}
      <Toaster position="top-center" richColors theme={theme} />

      {/* ✅ Sticky-шапка (десктоп): назад слева, заголовок + refresh справа */}
      <div className="sticky top-0 z-20 bg-[#F5F1E8]/95 dark:bg-dark-bg/95 backdrop-blur-sm border-b border-[#E8E2D5] dark:border-dark-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 text-sm font-bold text-[#1B2A4A] dark:text-white hover:text-[#C9A961] dark:hover:text-gold transition-colors"
          >
            <span className="w-10 h-10 rounded-full bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center">
              <ArrowLeft size={18} />
            </span>
            На главную
          </button>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1B2A4A] dark:text-white">Настройки</h1>
            <span className="w-10 h-10 rounded-full bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center">
              <SettingsIcon size={18} className="text-[#1B2A4A] dark:text-white" />
            </span>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[#1B2A4A] dark:text-white bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border hover:bg-[#F5F1E8] dark:hover:bg-dark-accent transition-colors"
            title="Обновить настройки"
          >
            <RefreshCw size={14} />
            Обновить
          </button>
        </div>
      </div>

      {/* ✅ Сетка секций: карточки в ряду одинаковой высоты (без пробелов) */}
      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ========== ТЕМА ОФОРМЛЕНИЯ ========== */}
        <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border overflow-hidden lg:col-span-2 flex flex-col">
          {/* Шапка секции + круглая кнопка «i» */}
          <div className="flex items-center gap-3 p-5 border-b border-[#E8E2D5] dark:border-dark-border">
            <div className="w-11 h-11 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
              <Monitor size={20} className="text-[#1B2A4A] dark:text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-[#1B2A4A] dark:text-white">Тема оформления</h2>
              <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">
                Светлая, тёмная или системная — применяется ко всей админ-панели
              </p>
            </div>
            <InfoToggle
              open={showThemeInfo}
              onClick={() => setShowThemeInfo(v => !v)}
              title="О теме оформления"
            />
          </div>

          {/* ✅ Раскрываемое пояснение */}
          {showThemeInfo && (
            <div className="px-5 pt-5">
              <div className="flex items-start gap-3 p-4 bg-[#1B2A4A]/5 dark:bg-gold/10 border border-[#1B2A4A]/10 dark:border-gold/20 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-[#1B2A4A]/10 dark:bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <Info size={16} className="text-[#1B2A4A] dark:text-gold" />
                </div>
                <p className="text-xs text-[#1B2A4A] dark:text-white leading-relaxed">
                  Системная тема переключается автоматически вместе с настройками операционной системы. Выбор сохраняется и действует после перезагрузки панели.
                </p>
              </div>
            </div>
          )}

          <div className="p-5 flex flex-col md:flex-row items-stretch md:items-center gap-4 mt-auto">
            {/* ✅ 3 кнопки переключения */}
            <div className="grid grid-cols-3 gap-2 flex-1">
              <button
                onClick={() => setTheme('light')}
                title="Светлая тема"
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                  theme === 'light'
                    ? 'bg-[#1B2A4A] text-white dark:bg-gold dark:text-[#1B2A4A]'
                    : 'bg-[#F5F1E8] dark:bg-dark-accent text-[#8A8275] dark:text-gray-300 border border-[#E8E2D5] dark:border-dark-border hover:text-[#1B2A4A] dark:hover:text-gold'
                }`}
              >
                <Sun size={16} />
                Светлая
              </button>
              <button
                onClick={() => setTheme('dark')}
                title="Тёмная тема"
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                  theme === 'dark'
                    ? 'bg-[#1B2A4A] text-white dark:bg-gold dark:text-[#1B2A4A]'
                    : 'bg-[#F5F1E8] dark:bg-dark-accent text-[#8A8275] dark:text-gray-300 border border-[#E8E2D5] dark:border-dark-border hover:text-[#1B2A4A] dark:hover:text-gold'
                }`}
              >
                <Moon size={16} />
                Тёмная
              </button>
              <button
                onClick={() => setTheme('system')}
                title="Системная тема"
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                  theme === 'system'
                    ? 'bg-[#1B2A4A] text-white dark:bg-gold dark:text-[#1B2A4A]'
                    : 'bg-[#F5F1E8] dark:bg-dark-accent text-[#8A8275] dark:text-gray-300 border border-[#E8E2D5] dark:border-dark-border hover:text-[#1B2A4A] dark:hover:text-gold'
                }`}
              >
                <Monitor size={16} />
                Системная
              </button>
            </div>

            {/* ✅ Плашка текущего состояния */}
            <div className="flex items-center gap-3 p-4 bg-[#F5F1E8]/60 dark:bg-dark-accent/40 border border-[#E8E2D5] dark:border-dark-border rounded-xl md:w-72 flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
                {theme === 'light' ? (
                  <Sun size={16} className="text-[#C9A961]" />
                ) : theme === 'dark' ? (
                  <Moon size={16} className="text-[#C9A961]" />
                ) : (
                  <Monitor size={16} className="text-[#C9A961]" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[#8A8275] dark:text-gray-300">Сейчас выбрана</p>
                <p className="text-sm font-bold text-[#1B2A4A] dark:text-white truncate">
                  {theme === 'light' ? 'Светлая' : theme === 'dark' ? 'Тёмная' : 'Системная'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========== РЕЖИМ СКИДОК ========== */}
        <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border overflow-hidden flex flex-col">
          {/* Шапка секции + круглая кнопка «i» */}
          <div className="flex items-center gap-3 p-5 border-b border-[#E8E2D5] dark:border-dark-border">
            <div className="w-11 h-11 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
              <Tag size={20} className="text-[#9B3B3B] dark:text-red-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-[#1B2A4A] dark:text-white">Режим скидок</h2>
              <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">
                Переключатель видимости скидок в приложении
              </p>
            </div>
            <InfoToggle
              open={showSaleInfo}
              onClick={() => setShowSaleInfo(v => !v)}
              title="О режиме скидок"
            />
          </div>

          {/* ✅ Раскрываемое пояснение */}
          {showSaleInfo && (
            <div className="px-5 pt-5">
              <div className="flex items-start gap-3 p-4 bg-[#9B3B3B]/5 dark:bg-red-500/10 border border-[#9B3B3B]/15 dark:border-red-500/20 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-[#9B3B3B]/10 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Info size={16} className="text-[#9B3B3B] dark:text-red-400" />
                </div>
                <div className="text-xs text-[#9B3B3B] dark:text-red-300 leading-relaxed">
                  <p><b>Включён:</b> товары со скидкой показываются с перечёркнутой старой ценой, бокс «💰 Скидки» виден на главной.</p>
                  <p className="mt-1"><b>Выключен:</b> все цены обычные, бокс скидок скрыт.</p>
                </div>
              </div>
            </div>
          )}

          {/* Строка состояния + кнопка (прижата к низу карточки) */}
          <div className="p-5 flex items-center justify-between gap-6 mt-auto">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
                <span className="text-lg">{saleMode ? '✅' : '⛔'}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#1B2A4A] dark:text-white">
                  {saleMode ? 'Скидки включены' : 'Скидки выключены'}
                </p>
                <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">
                  {saleMode ? 'Клиенты видят скидочные цены' : 'Клиенты видят обычные цены'}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleSaleMode}
              disabled={savingSaleMode}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex-shrink-0 ${
                saleMode
                  ? 'bg-[#9B3B3B] dark:bg-red-900 text-white hover:bg-[#7a2f2f] dark:hover:bg-red-800'
                  : 'bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A] hover:bg-[#142038] dark:hover:bg-[#d6b57e]'
              }`}
            >
              {savingSaleMode ? 'Сохранение...' : (saleMode ? 'Выключить' : 'Включить')}
            </button>
          </div>
        </div>

        {/* ========== ДОСТАВКА ========== */}
        <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border overflow-hidden flex flex-col">
          {/* Шапка секции + круглая кнопка «i» */}
          <div className="flex items-center gap-3 p-5 border-b border-[#E8E2D5] dark:border-dark-border">
            <div className="w-11 h-11 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
              <Truck size={20} className="text-[#1B2A4A] dark:text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-[#1B2A4A] dark:text-white">Доставка</h2>
              <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">
                Цена доставки в приложении при выборе «Доставка»
              </p>
            </div>
            <InfoToggle
              open={showDeliveryInfo}
              onClick={() => setShowDeliveryInfo(v => !v)}
              title="О цене доставки"
            />
          </div>

          {/* ✅ Раскрываемое пояснение */}
          {showDeliveryInfo && (
            <div className="px-5 pt-5">
              <div className="flex items-start gap-3 p-4 bg-[#1B2A4A]/5 dark:bg-gold/10 border border-[#1B2A4A]/10 dark:border-gold/20 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-[#1B2A4A]/10 dark:bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <Info size={16} className="text-[#1B2A4A] dark:text-gold" />
                </div>
                <div className="text-xs text-[#1B2A4A] dark:text-white leading-relaxed">
                  <p>Эта сумма добавляется к итогу заказа, когда клиент выбирает «Доставка».</p>
                  <p className="mt-1">Укажите <b>0</b> — и доставка будет <b>бесплатной</b> (в корзине напишется «Бесплатно»).</p>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Ввод + кнопка (прижаты к низу карточки) */}
          <div className="p-5 space-y-4 mt-auto">
            <div className="flex items-center justify-between gap-6">
              <div className="min-w-0">
                <label className="text-sm font-bold text-[#1B2A4A] dark:text-white block">
                  Цена доставки (сум)
                </label>
                <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">
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
                  className="w-40 px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold text-base font-bold bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white text-right"
                  step="1000"
                  min="0"
                />
                <span className="px-4 py-3 bg-[#E8E2D5] dark:bg-dark-border text-[#1B2A4A] dark:text-white rounded-xl text-sm font-bold">
                  сум
                </span>
              </div>
            </div>

            <button
              onClick={handleSaveDelivery}
              disabled={savingDelivery}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A] rounded-xl font-bold hover:bg-[#142038] dark:hover:bg-[#d6b57e] transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              {savingDelivery ? 'Сохранение...' : 'Сохранить цену доставки'}
            </button>
          </div>
        </div>

        {/* ========== КУРС ВАЛЮТ ========== */}
        <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border overflow-hidden lg:col-span-2">
          {/* Шапка секции */}
          <div className="flex items-center gap-3 p-5 border-b border-[#E8E2D5] dark:border-dark-border">
            <div className="w-11 h-11 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
              <DollarSign size={20} className="text-[#C9A961]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#1B2A4A] dark:text-white">Курс валют</h2>
              <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">
                USD → UZS, используется для отображения цен в сумах
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-5">
            {/* Левая колонка: ввод курса */}
            <div>
              <div className="flex items-center justify-between gap-6 p-4 bg-[#F5F1E8]/60 dark:bg-dark-accent/40 border border-[#E8E2D5] dark:border-dark-border rounded-xl">
                <div className="min-w-0">
                  <label className="text-sm font-bold text-[#1B2A4A] dark:text-white block">
                    Курс USD к UZS
                  </label>
                  <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">
                    Фиксируется в каждом заказе
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <input
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                    className="w-36 px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold text-base font-bold bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white text-right"
                    step="0.01"
                    min="0"
                  />
                  <span className="px-4 py-3 bg-[#E8E2D5] dark:bg-dark-border text-[#1B2A4A] dark:text-white rounded-xl text-sm font-bold">
                    сум
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <button
                  onClick={handleFetchFromAPI}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white rounded-xl font-bold hover:bg-[#F5F1E8] dark:hover:bg-dark-border transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={18} className={saving ? 'animate-spin' : ''} />
                  Получить курс
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#C9A961] dark:bg-gold text-white dark:text-[#1B2A4A] rounded-xl font-bold hover:bg-[#b8954f] dark:hover:bg-[#d6b57e] transition-colors disabled:opacity-50"
                >
                  <Save size={18} />
                  Сохранить курс
                </button>
              </div>
            </div>

            {/* Правая колонка: информация об обновлении */}
            <div className="bg-[#F5F1E8]/60 dark:bg-dark-accent/40 border border-[#E8E2D5] dark:border-dark-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
                  <span className="text-base">📋</span>
                </div>
                <p className="text-sm font-bold text-[#1B2A4A] dark:text-white">Последнее обновление</p>
              </div>
              {lastUpdated ? (
                <div className="space-y-2 text-xs text-[#8A8275] dark:text-gray-300">
                  <p className="flex justify-between gap-4">
                    <span>📅 Дата:</span>
                    <span className="font-bold text-[#1B2A4A] dark:text-white text-right">{lastUpdated}</span>
                  </p>
                  <p className="flex justify-between gap-4">
                    <span>👤 Кем:</span>
                    <span className="font-bold text-[#1B2A4A] dark:text-white">{updatedBy === 'admin' ? 'Менеджером' : 'Автоматически'}</span>
                  </p>
                  <p className="flex justify-between gap-4">
                    <span>🔢 Версия:</span>
                    <span className="font-bold text-[#1B2A4A] dark:text-white">{currentVersion}</span>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#8A8275] dark:text-gray-300">Курс ещё не обновлялся вручную</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}