import AdminLanguagePicker from '../components/AdminLanguagePicker'
import {t,tx,uiError,getAdminLocale,useAdminLanguage} from '../lib/i18n'
import PageSkeleton from '../components/PageSkeleton'
import { ClipboardList } from 'lucide-react'
import { CheckCircle2, CircleSlash } from 'lucide-react'
import { dataCache } from '../lib/resourceCache'
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
import { toast } from 'sonner'

interface SettingsCacheData {
  exchangeRate: number
  saleMode: boolean
  deliveryPrice: number
  freeDeliveryThreshold: number // ✅ НОВОЕ
  lastUpdated: string
  updatedBy: string
  currentVersion: number
  timestamp: number
}

const getSettingsCache = (section:string) => dataCache.get<SettingsCacheData>('admin:settings:'+section)
const setSettingsCache = (section:string,data: Omit<SettingsCacheData, 'timestamp'>) => dataCache.set('admin:settings:'+section, { ...data, timestamp: Date.now() }, 60_000)
const invalidateSettingsCache = () => { dataCache.invalidate('admin:settings'); dataCache.invalidate('admin:payment-cards'); dataCache.invalidate('http:') }

function InfoToggle({ open, onClick, title }: { open: boolean; onClick: () => void; title: string }) {
 useAdminLanguage()

  return (
    <button
      onClick={onClick}
      title={tx(title)}
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

export default function SettingsForms({section,embedded=false}:{section:'theme'|'sale'|'delivery'|'prices';embedded?:boolean}) {
 useAdminLanguage()

  const [dirty,setDirty]=useState(false)
  const titles={theme:'Язык и оформление',sale:'Скидки',delivery:'Оплата и доставка',prices:'Валюта и цены'}
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  const [cached] = useState(()=>getSettingsCache(section))
  const [exchangeRate, setExchangeRate] = useState<number>(cached?.exchangeRate ?? 0)
  const [loading, setLoading] = useState(section!=='theme'&&!cached)
  const [saving, setSaving] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>(cached?.lastUpdated ?? '')
  const [updatedBy, setUpdatedBy] = useState<string>(cached?.updatedBy ?? 'system')
  const [currentVersion, setCurrentVersion] = useState<number>(cached?.currentVersion ?? 0)

  const [saleMode, setSaleMode] = useState(cached?.saleMode ?? false)
  const [savingSaleMode, setSavingSaleMode] = useState(false)

  const [deliveryPrice, setDeliveryPrice] = useState<number>(cached?.deliveryPrice ?? 0)
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(cached?.freeDeliveryThreshold ?? 0) // ✅ НОВОЕ
  const [savingDelivery, setSavingDelivery] = useState(false)

  const [showThemeInfo, setShowThemeInfo] = useState(false)
  const [showSaleInfo, setShowSaleInfo] = useState(false)
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const cached = getSettingsCache(section)
    if (cached) {
      setExchangeRate(cached.exchangeRate)
      setSaleMode(cached.saleMode)
      setDeliveryPrice(cached.deliveryPrice)
      setFreeDeliveryThreshold(cached.freeDeliveryThreshold || 0) // ✅ НОВОЕ
      setLastUpdated(cached.lastUpdated)
      setUpdatedBy(cached.updatedBy)
      setCurrentVersion(cached.currentVersion)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      let rate=0,updBy='system',version=0,updAt='',sale=false,delivery=0,threshold=0
      const keys=section==='prices'?['exchange_rate']:section==='sale'?['sale_mode_enabled']:section==='delivery'?['exchange_rate','delivery_price','free_delivery_threshold']:[]
      if(!keys.length){setLoading(false);return}
      const {data:rows,error}=await supabase.from('settings').select('*').in('key',keys)
      if(error)throw error
      const settings=Object.fromEntries((rows||[]).map(row=>[row.key,row]))
      if(keys.some(key=>!settings[key]))throw new Error('Не удалось загрузить настройки')
      if(settings.exchange_rate){const row=settings.exchange_rate;rate=Number(row.value?.rate);if(!Number.isFinite(rate)||rate<=0)throw new Error('Курс магазина недоступен');updBy=row.value?.updated_by||'system';version=row.value?.version||0;updAt=row.updated_at?new Date(row.updated_at).toLocaleString(getAdminLocale()):''}
      sale=settings.sale_mode_enabled?.value?.enabled===true
      const deliveryValue=settings.delivery_price?.value,thresholdValue=settings.free_delivery_threshold?.value
      if(deliveryValue)delivery=Number(deliveryValue.price_usd??Number(deliveryValue.price||0)/rate)
      if(thresholdValue)threshold=Number(thresholdValue.amount_usd??Number(thresholdValue.amount||0)/rate)
      setExchangeRate(rate)
      setUpdatedBy(updBy)
      setCurrentVersion(version)
      setLastUpdated(updAt)
      setSaleMode(sale)
      setDeliveryPrice(Math.round(delivery * 100) / 100)
      setFreeDeliveryThreshold(Math.round(threshold * 100) / 100)

      setSettingsCache(section,{ exchangeRate: rate, saleMode: sale, deliveryPrice: Math.round(delivery * 100) / 100, freeDeliveryThreshold: Math.round(threshold * 100) / 100, lastUpdated: updAt, updatedBy: updBy, currentVersion: version })
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error)
      toast.error(uiError('Ошибка загрузки настроек'))
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!exchangeRate || exchangeRate <= 0) {
      toast.error(uiError('Введите корректный курс'))
      return
    }
    setSaving(true)
    try {
      const newVersion = Date.now()
      const { error } = await supabase.from('settings').upsert({
        key: 'exchange_rate',
        value: { rate: exchangeRate, updated_by: 'admin', updated_at: new Date().toISOString(), version: newVersion },
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' })
      if (error) throw error

      setCurrentVersion(newVersion)
      setUpdatedBy('admin')
      const newLastUpdated = new Date().toLocaleString(getAdminLocale())
      setLastUpdated(newLastUpdated)
      setSettingsCache(section,{ exchangeRate, saleMode, deliveryPrice, freeDeliveryThreshold, lastUpdated: newLastUpdated, updatedBy: 'admin', currentVersion: newVersion })
      setDirty(false)
      toast.success(tx(t("Курс успешно обновлён! (версия: {0})",[newVersion])))
    } catch (error) {
      console.error('Ошибка сохранения:', error)
      toast.error(uiError('Ошибка сохранения'))
    }
    setSaving(false)
  }

  const handleFetchFromAPI = async () => {
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Требуется авторизация')
      const response = await fetch('/api/getExchangeRate', { headers: { Authorization: `Bearer ${session.access_token}` } })
      const data = await response.json()
      if (data.success && data.rate) {
        setExchangeRate(data.rate)
        setDirty(true)
        setDirty(false)
      toast.success(tx(t("Курс получен: {0} ({1})",[data.rate,data.source])))
      } else {
        toast.error(uiError(`Ошибка: ${data.error || 'Не удалось получить курс'}`))
      }
    } catch (error) {
      console.error('Ошибка получения курса:', error)
      toast.error(uiError('Ошибка получения курса'))
    }
    setSaving(false)
  }

  const handleToggleSaleMode = async () => {
    setSavingSaleMode(true)
    try {
      const newValue = !saleMode
      const { error } = await supabase.from('settings').upsert({
        key: 'sale_mode_enabled',
        value: { enabled: newValue, updated_by: 'admin', updated_at: new Date().toISOString(), version: Date.now() },
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' })
      if (error) throw error
      setSaleMode(newValue)
      setSettingsCache(section,{ exchangeRate, saleMode: newValue, deliveryPrice, freeDeliveryThreshold, lastUpdated, updatedBy, currentVersion })
      setDirty(false)
      toast.success(tx(newValue?t(" Режим скидок ВКЛЮЧЁН"):t(" Режим скидок ВЫКЛЮЧЕН")))
    } catch (error) {
      console.error('Ошибка переключения режима скидок:', error)
      toast.error(uiError('Ошибка сохранения'))
    }
    setSavingSaleMode(false)
  }

  // ✅ Сохранение настроек доставки (включая порог бесплатной)
  const handleSaveDelivery = async () => {
    if (![deliveryPrice, freeDeliveryThreshold].every(value => Number.isFinite(value) && value >= 0 && value <= 1000000 && Math.abs(value * 100 - Math.round(value * 100)) < 0.000001)) {
      toast.error(uiError('Введите неотрицательные суммы в долларах, не более двух знаков после точки'))
      return
    }
    setSavingDelivery(true)
    try {
      const { error } = await supabase.rpc('store_admin_save_delivery', { p_price_usd: deliveryPrice, p_threshold_usd: freeDeliveryThreshold })
      if (error) throw error

      setSettingsCache(section,{ exchangeRate, saleMode, deliveryPrice, freeDeliveryThreshold, lastUpdated, updatedBy, currentVersion })
      setDirty(false)
      toast.success(tx(t("Настройки доставки сохранены ")))
    } catch (error) {
      console.error('Ошибка сохранения цены доставки:', error)
      toast.error(uiError('Ошибка сохранения'))
    }
    setSavingDelivery(false)
  }

  const handleRefresh = () => {
    if(dirty&&!confirm(tx(t("Обновить настройки и отменить несохранённые изменения?"))))return
    setDirty(false)
    invalidateSettingsCache()
    loadSettings()
  }

  if(loading)return <PageSkeleton title={tx(titles[section])}/>

  return (
    <div data-loft-dirty={dirty?'true':undefined} onChange={()=>setDirty(true)} className={`${embedded?'':'min-h-screen'} bg-[#F5F1E8] dark:bg-dark-bg`}>

      {!embedded&&(<div className="sticky top-0 z-20 bg-[#F5F1E8]/95 dark:bg-dark-bg/95 backdrop-blur-sm border-b border-[#E8E2D5] dark:border-dark-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <button onClick={() => navigate('/settings')} className="flex items-center gap-3 text-sm font-bold text-[#1B2A4A] dark:text-white hover:text-[#C9A961] dark:hover:text-gold transition-colors">
            <span className="w-10 h-10 rounded-full bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center">
              <ArrowLeft size={18} />
            </span>
            {t("Настройки")}</button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1B2A4A] dark:text-white">{tx(titles[section])}</h1>
            <span className="w-10 h-10 rounded-full bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center">
              <SettingsIcon size={18} className="text-[#1B2A4A] dark:text-white" />
            </span>
          </div>
          <button onClick={handleRefresh} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[#1B2A4A] dark:text-white bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border hover:bg-[#F5F1E8] dark:hover:bg-dark-accent transition-colors" title={t("Обновить настройки")}>
            <RefreshCw size={14} />
            {t("Обновить")}</button>
        </div>
      </div>)}

      <div data-loft-content className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ========== ТЕМА ОФОРМЛЕНИЯ ========== */}
        {section==='theme'&&<AdminLanguagePicker/>}
        {section==='theme'&&(<div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border overflow-hidden lg:col-span-2 flex flex-col">
          <div className="flex items-center gap-3 p-5 border-b border-[#E8E2D5] dark:border-dark-border">
            <div className="w-11 h-11 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
              <Monitor size={20} className="text-[#1B2A4A] dark:text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-[#1B2A4A] dark:text-white">{t("Тема оформления")}</h2>
              <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">{t("Светлая, тёмная или системная — применяется ко всей админ-панели")}</p>
            </div>
            <InfoToggle open={showThemeInfo} onClick={() => setShowThemeInfo(v => !v)} title={t("О теме оформления")} />
          </div>
          {showThemeInfo && (
            <div className="px-5 pt-5">
              <div className="flex items-start gap-3 p-4 bg-[#1B2A4A]/5 dark:bg-gold/10 border border-[#1B2A4A]/10 dark:border-gold/20 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-[#1B2A4A]/10 dark:bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <Info size={16} className="text-[#1B2A4A] dark:text-gold" />
                </div>
                <p className="text-xs text-[#1B2A4A] dark:text-white leading-relaxed">{t("Системная тема переключается автоматически вместе с настройками операционной системы. Выбор сохраняется и действует после перезагрузки панели.")}</p>
              </div>
            </div>
          )}
          <div className="p-5 flex flex-col md:flex-row items-stretch md:items-center gap-4 mt-auto">
            <div className="grid grid-cols-3 gap-2 flex-1">
              <button onClick={() => setTheme('light')} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${theme === 'light' ? 'bg-[#1B2A4A] text-white dark:bg-gold dark:text-[#1B2A4A]' : 'bg-[#F5F1E8] dark:bg-dark-accent text-[#8A8275] dark:text-gray-300 border border-[#E8E2D5] dark:border-dark-border hover:text-[#1B2A4A] dark:hover:text-gold'}`}>
                <Sun size={16} /> {' '}{t("Светлая")}</button>
              <button onClick={() => setTheme('dark')} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${theme === 'dark' ? 'bg-[#1B2A4A] text-white dark:bg-gold dark:text-[#1B2A4A]' : 'bg-[#F5F1E8] dark:bg-dark-accent text-[#8A8275] dark:text-gray-300 border border-[#E8E2D5] dark:border-dark-border hover:text-[#1B2A4A] dark:hover:text-gold'}`}>
                <Moon size={16} /> {' '}{t("Тёмная")}</button>
              <button onClick={() => setTheme('system')} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${theme === 'system' ? 'bg-[#1B2A4A] text-white dark:bg-gold dark:text-[#1B2A4A]' : 'bg-[#F5F1E8] dark:bg-dark-accent text-[#8A8275] dark:text-gray-300 border border-[#E8E2D5] dark:border-dark-border hover:text-[#1B2A4A] dark:hover:text-gold'}`}>
                <Monitor size={16} /> {' '}{t("Системная")}</button>
            </div>
            <div className="flex items-center gap-3 p-4 bg-[#F5F1E8]/60 dark:bg-dark-accent/40 border border-[#E8E2D5] dark:border-dark-border rounded-xl md:w-72 flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
                {theme === 'light' ? <Sun size={16} className="text-[#C9A961]" /> : theme === 'dark' ? <Moon size={16} className="text-[#C9A961]" /> : <Monitor size={16} className="text-[#C9A961]" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[#8A8275] dark:text-gray-300">{t("Сейчас выбрана")}</p>
                <p className="text-sm font-bold text-[#1B2A4A] dark:text-white truncate">{theme === 'light'?t("Светлая"):theme === 'dark'?t("Тёмная"):t("Системная")}</p>
              </div>
            </div>
          </div>
        </div>)}

        {/* ========== РЕЖИМ СКИДОК ========== */}
        {section==='sale'&&(<div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border overflow-hidden flex flex-col">
          <div className="flex items-center gap-3 p-5 border-b border-[#E8E2D5] dark:border-dark-border">
            <div className="w-11 h-11 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
              <Tag size={20} className="text-[#9B3B3B] dark:text-red-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-[#1B2A4A] dark:text-white">{t("Режим скидок")}</h2>
              <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">{t("Переключатель видимости скидок в приложении")}</p>
            </div>
            <InfoToggle open={showSaleInfo} onClick={() => setShowSaleInfo(v => !v)} title={t("О режиме скидок")} />
          </div>
          {showSaleInfo && (
            <div className="px-5 pt-5">
              <div className="flex items-start gap-3 p-4 bg-[#9B3B3B]/5 dark:bg-red-500/10 border border-[#9B3B3B]/15 dark:border-red-500/20 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-[#9B3B3B]/10 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Info size={16} className="text-[#9B3B3B] dark:text-red-400" />
                </div>
                <div className="text-xs text-[#9B3B3B] dark:text-red-300 leading-relaxed">
                  <p><b>{t("Включён:")}</b> {' '}{t("товары со скидкой показываются с перечёркнутой старой ценой.")}</p>
                  <p className="mt-1"><b>{t("Выключен:")}</b> {' '}{t("все цены обычные, блок скидок скрыт.")}</p>
                </div>
              </div>
            </div>
          )}
          <div className="p-5 flex items-center justify-between gap-6 mt-auto">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
                <span>{saleMode ? <CheckCircle2 size={20} /> : <CircleSlash size={20} />}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#1B2A4A] dark:text-white">{saleMode?t("Скидки включены"):t("Скидки выключены")}</p>
                <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">{saleMode?t("Клиенты видят скидочные цены"):t("Клиенты видят обычные цены")}</p>
              </div>
            </div>
            <button onClick={handleToggleSaleMode} disabled={savingSaleMode} className={`px-6 py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex-shrink-0 ${saleMode ? 'bg-[#9B3B3B] dark:bg-red-900 text-white hover:bg-[#7a2f2f] dark:hover:bg-red-800' : 'bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A] hover:bg-[#142038] dark:hover:bg-[#d6b57e]'}`}>
              {savingSaleMode?t("Сохранение..."):(saleMode?t("Выключить"):t("Включить"))}
            </button>
          </div>
        </div>)}

        {/* ========== ДОСТАВКА ========== */}
        {section==='delivery'&&(<div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border overflow-hidden flex flex-col">
          <div className="flex items-center gap-3 p-5 border-b border-[#E8E2D5] dark:border-dark-border">
            <div className="w-11 h-11 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
              <Truck size={20} className="text-[#1B2A4A] dark:text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-[#1B2A4A] dark:text-white">{t("Доставка")}</h2>
              <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">{t("Стоимость и условия доставки")}</p>
            </div>
            <InfoToggle open={showDeliveryInfo} onClick={() => setShowDeliveryInfo(v => !v)} title={t("О доставке")} />
          </div>
          {showDeliveryInfo && (
            <div className="px-5 pt-5">
              <div className="flex items-start gap-3 p-4 bg-[#1B2A4A]/5 dark:bg-gold/10 border border-[#1B2A4A]/10 dark:border-gold/20 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-[#1B2A4A]/10 dark:bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <Info size={16} className="text-[#1B2A4A] dark:text-gold" />
                </div>
                <div className="text-xs text-[#1B2A4A] dark:text-white leading-relaxed">
                  <p>{t("Эта сумма добавляется к итогу заказа при выборе «Доставка».")}</p>
                  <p className="mt-1">{t("Если сумма заказа превысит указанный порог, доставка станет")}{' '}<b>{t("бесплатной")}</b>.</p>
                </div>
              </div>
            </div>
          )}
          <div className="p-5 space-y-4 mt-auto">
            <div className="flex items-center justify-between gap-6">
              <div className="min-w-0">
                <label className="text-sm font-bold text-[#1B2A4A] dark:text-white block">{t("Цена доставки (USD)")}</label>
                <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">{deliveryPrice > 0?t("Сейчас: {0} USD",[deliveryPrice.toLocaleString(getAdminLocale(), { maximumFractionDigits: 2 })]):t("Сейчас: доставка бесплатная")}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <input aria-label={t("Цена доставки (USD)")} type="number" value={deliveryPrice} onChange={(e) => setDeliveryPrice(Math.max(0, Number(e.target.value) || 0))} className="w-40 px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold text-base font-bold bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white text-right" step="0.01" min="0" />
                <span className="px-4 py-3 bg-[#E8E2D5] dark:bg-dark-border text-[#1B2A4A] dark:text-white rounded-xl text-sm font-bold">USD</span>
              </div>
            </div>

            {/* ✅ НОВОЕ: Порог бесплатной доставки */}
            <div className="flex items-center justify-between gap-6 pt-4 border-t border-[#E8E2D5] dark:border-dark-border">
              <div className="min-w-0">
                <label className="text-sm font-bold text-[#1B2A4A] dark:text-white block">{t("Порог бесплатной доставки (USD)")}</label>
                <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">
                  {freeDeliveryThreshold > 0?t("При заказе от {0} USD",[freeDeliveryThreshold.toLocaleString(getAdminLocale(), { maximumFractionDigits: 2 })]):t("Отключено (всегда платная)")}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <input aria-label={t("Порог бесплатной доставки (USD)")} type="number" value={freeDeliveryThreshold} onChange={(e) => setFreeDeliveryThreshold(Math.max(0, Number(e.target.value) || 0))} className="w-40 px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold text-base font-bold bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white text-right" step="0.01" min="0" placeholder="0" />
                <span className="px-4 py-3 bg-[#E8E2D5] dark:bg-dark-border text-[#1B2A4A] dark:text-white rounded-xl text-sm font-bold">USD</span>
              </div>
            </div>

            <button onClick={handleSaveDelivery} disabled={savingDelivery} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A] rounded-xl font-bold hover:bg-[#142038] dark:hover:bg-[#d6b57e] transition-colors disabled:opacity-50">
              <Save size={18} />
              {savingDelivery?t("Сохранение..."):t("Сохранить настройки доставки")}
            </button>
          </div>
        </div>)}

        {/* ========== КУРС ВАЛЮТ ========== */}
        {section==='prices'&&(<div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border overflow-hidden lg:col-span-2">
          <div className="flex items-center gap-3 p-5 border-b border-[#E8E2D5] dark:border-dark-border">
            <div className="w-11 h-11 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
              <DollarSign size={20} className="text-[#C9A961]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#1B2A4A] dark:text-white">{t("Курс валют")}</h2>
              <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">{t("USD → UZS, используется для отображения цен в сумах")}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-5">
            <div>
              <div className="flex items-center justify-between gap-6 p-4 bg-[#F5F1E8]/60 dark:bg-dark-accent/40 border border-[#E8E2D5] dark:border-dark-border rounded-xl">
                <div className="min-w-0">
                  <label className="text-sm font-bold text-[#1B2A4A] dark:text-white block">{t("Курс USD к UZS")}</label>
                  <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">{t("Фиксируется в каждом заказе")}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <input type="number" value={exchangeRate} onChange={(e) => setExchangeRate(Number(e.target.value))} className="w-36 px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold text-base font-bold bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white text-right" step="0.01" min="0" />
                  <span className="px-4 py-3 bg-[#E8E2D5] dark:bg-dark-border text-[#1B2A4A] dark:text-white rounded-xl text-sm font-bold">{t("сум")}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <button onClick={handleFetchFromAPI} disabled={saving} className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white rounded-xl font-bold hover:bg-[#F5F1E8] dark:hover:bg-dark-border transition-colors disabled:opacity-50">
                  <RefreshCw size={18} className={saving ? 'animate-spin' : ''} />
                  {t("Получить курс")}</button>
                <button onClick={handleSave} disabled={saving} className="flex items-center justify-center gap-2 px-4 py-3 bg-[#C9A961] dark:bg-gold text-white dark:text-[#1B2A4A] rounded-xl font-bold hover:bg-[#b8954f] dark:hover:bg-[#d6b57e] transition-colors disabled:opacity-50">
                  <Save size={18} />
                  {t("Сохранить курс")}</button>
              </div>
            </div>
            <div className="bg-[#F5F1E8]/60 dark:bg-dark-accent/40 border border-[#E8E2D5] dark:border-dark-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
                  <ClipboardList size={18} />
                </div>
                <p className="text-sm font-bold text-[#1B2A4A] dark:text-white">{t("Последнее обновление")}</p>
              </div>
              {lastUpdated ? (
                <div className="space-y-2 text-xs text-[#8A8275] dark:text-gray-300">
                  <p className="flex justify-between gap-4"><span> {' '}{t("Дата:")}</span><span className="font-bold text-[#1B2A4A] dark:text-white text-right">{lastUpdated}</span></p>
                  <p className="flex justify-between gap-4"><span> {' '}{t("Кем:")}</span><span className="font-bold text-[#1B2A4A] dark:text-white">{updatedBy === 'admin'?t("Менеджером"):t("Автоматически")}</span></p>
                  <p className="flex justify-between gap-4"><span> {' '}{t("Версия:")}</span><span className="font-bold text-[#1B2A4A] dark:text-white">{currentVersion}</span></p>
                </div>
              ) : (
                <p className="text-xs text-[#8A8275] dark:text-gray-300">{t("Курс ещё не обновлялся вручную")}</p>
              )}
            </div>
          </div>
        </div>)}
      </div>
    </div>
  )
}
