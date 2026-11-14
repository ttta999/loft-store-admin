import {t,tx,uiError,getAdminLocale,useAdminLanguage} from '../lib/i18n'
import PageSkeleton from '../components/PageSkeleton'
import { useAdminRefresh } from '../lib/adminLive'
import { Check as TipCheck, X as TipClose, Trash2 as TipTrash, Image as TipImage } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { brandsCacheApi } from '../lib/cache'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Tag,
  X,
  Info,
  Check,
  XCircle,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'

interface Brand {
  id: string
  name: string
  is_active: boolean
  logo_url: string | null
  created_at: string
}

const isFullBrandRows = (list: any[]): boolean =>
  !list || list.length === 0 || (list[0] != null && typeof list[0].name === 'string')

export default function BrandsPage() {
 useAdminLanguage()

  const navigate = useNavigate()
  const [cached] = useState(() => { const rows = brandsCacheApi.get(); return rows && isFullBrandRows(rows) ? rows as Brand[] : null })
  const [brands, setBrands] = useState<Brand[]>(cached ?? [])
  const [loading, setLoading] = useState(!cached)
  const [refreshing, setRefreshing] = useState(false)
  
  // Модалка добавления
  const [showAddModal, setShowAddModal] = useState(false)
  const [newBrandName, setNewBrandName] = useState('')
  const [newBrandLogo, setNewBrandLogo] = useState('')
  
  // Модалка редактирования
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)

  useEffect(() => {
    loadBrands(false)
  }, [])

  useAdminRefresh(['brands'],()=>loadBrands(false,true))
  const loadBrands = async (forceRefresh = false, background = false) => {
    if (!forceRefresh) {
      const cached = brandsCacheApi.get()
      if (cached && isFullBrandRows(cached as any[])) {
        setBrands(cached as Brand[])
        setLoading(false)
        return
      }
      if (cached) brandsCacheApi.invalidate()
    }

    if (forceRefresh) setRefreshing(true)
    else if (!background) setLoading(true)

    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name')
      if (error) throw error
      
      const brandsList = data || []
      setBrands(brandsList)
      brandsCacheApi.set(brandsList)
    } catch (error) {
      console.error('Ошибка загрузки брендов:', error)
      toast.error(uiError('Ошибка загрузки брендов'))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    brandsCacheApi.invalidate()
    loadBrands(true)
  }

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) {
      toast.error(uiError('Введите название бренда'))
      return
    }
    try {
      const { error } = await supabase
        .from('brands')
        .insert({
          name: newBrandName.trim(),
          logo_url: newBrandLogo.trim() || null,
          is_active: true
        })
      if (error) throw error
      toast.success(tx(t("Бренд добавлен!")))
      setNewBrandName('')
      setNewBrandLogo('')
      setShowAddModal(false)
      brandsCacheApi.invalidate()
      await loadBrands(true)
    } catch (error: any) {
      console.error('Ошибка добавления:', error)
      if (error.code === '23505') {
        toast.error(uiError('Такой бренд уже существует'))
      } else {
        toast.error(uiError('Ошибка добавления бренда'))
      }
    }
  }

  const handleToggleBrand = async (brand: Brand) => {
    try {
      const { error } = await supabase
        .from('brands')
        .update({ is_active: !brand.is_active })
        .eq('id', brand.id)
      if (error) throw error
      toast.success(tx(brand.is_active?t("Бренд деактивирован"):t("Бренд активирован")))
      brandsCacheApi.invalidate()
      await loadBrands(true)
    } catch (error) {
      console.error('Ошибка обновления:', error)
      toast.error(uiError('Ошибка обновления'))
    }
  }

  const handleDeleteBrand = async (brand: Brand) => {
    if (!confirm(tx(t("Удалить бренд \"{0}\"?",[brand.name])))) return
    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', brand.id)
      if (error) throw error
      toast.success(tx(t("Бренд удалён")))
      brandsCacheApi.invalidate()
      await loadBrands(true)
    } catch (error) {
      console.error('Ошибка удаления:', error)
      toast.error(uiError('Ошибка удаления'))
    }
  }

  const handleEditBrand = async () => {
    if (!editingBrand || !editingBrand.name.trim()) {
      toast.error(uiError('Введите название бренда'))
      return
    }
    try {
      const { error } = await supabase
        .from('brands')
        .update({ 
          name: editingBrand.name.trim(),
          logo_url: editingBrand.logo_url?.trim() || null
        })
        .eq('id', editingBrand.id)
      if (error) throw error
      toast.success(tx(t("Бренд обновлён")))
      setEditingBrand(null)
      brandsCacheApi.invalidate()
      await loadBrands(true)
    } catch (error: any) {
      console.error('Ошибка обновления:', error)
      if (error.code === '23505') {
        toast.error(uiError('Такой бренд уже существует'))
      } else {
        toast.error(uiError('Ошибка обновления'))
      }
    }
  }

  if(loading)return <PageSkeleton title={t("Бренды")}/>

  const activeCount = brands.filter(b => b.is_active).length

  return (
    <div className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg">

      <div className="sticky top-0 z-20 bg-[#F5F1E8]/95 dark:bg-dark-bg/95 backdrop-blur-sm border-b border-[#E8E2D5] dark:border-dark-border px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 text-sm font-bold text-[#1B2A4A] dark:text-white hover:text-[#C9A961] dark:hover:text-gold transition-colors"
            >
              <span className="w-10 h-10 rounded-full bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center">
                <ArrowLeft size={18} />
              </span>
              {t("На главную")}</button>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#1B2A4A] dark:text-white">{t("Бренды")}</h1>
              <span className="w-10 h-10 rounded-full bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center">
                <Tag size={18} className="text-[#C9A961]" />
              </span>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A] hover:bg-[#142038] dark:hover:bg-[#d6b57e] transition-colors"
            >
              <Plus size={16} />
              {t("Добавить")}</button>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-4 py-2 rounded-xl text-sm font-bold bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white">
                {t("Всего:")}{' '}<span className="text-[#C9A961]">{brands.length}</span>
              </span>
              <span className="px-4 py-2 rounded-xl text-sm font-bold bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-500/30">
                {t("Активных:")}{' '}{activeCount}
              </span>
              <span className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 dark:bg-gray-500/20 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-500/30">
                {t("Неактивных:")}{' '}{brands.length - activeCount}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[#1B2A4A] dark:text-white bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border hover:bg-[#F5F1E8] dark:hover:bg-dark-accent transition-colors disabled:opacity-50"
              title={t("Обновить список")}
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              {t("Обновить")}</button>
          </div>
        </div>
      </div>

      <div data-loft-content className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border overflow-hidden">
          <div className="flex items-center gap-3 p-5 border-b border-[#E8E2D5] dark:border-dark-border">
            <div className="w-10 h-10 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
              <Tag size={18} className="text-[#C9A961]" />
            </div>
            <div className="flex-1 min-w-[120px]">
              <h2 className="text-lg font-bold text-[#1B2A4A] dark:text-white">{t("Все бренды")}</h2>
              <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">
                {t("Управление списком брендов магазина")}</p>
            </div>
          </div>

          <div className="divide-y divide-[#E8E2D5] dark:divide-dark-border">
            {brands.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-14 h-14 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border mx-auto mb-3 flex items-center justify-center">
                  <Tag size={24} className="text-[#8A8275] dark:text-gray-300" />
                </div>
                <p className="text-sm font-medium text-[#1B2A4A] dark:text-white mb-1">{t("Брендов пока нет")}</p>
                <p className="text-xs text-[#8A8275] dark:text-gray-300">{t("Добавьте первый бренд, чтобы начать")}</p>
              </div>
            ) : (
              brands.map((brand) => {
                const safeName = brand.name || '—'
                return (
                  <div key={brand.id} className="flex flex-wrap items-center gap-4 p-4 hover:bg-[#F5F1E8] dark:hover:bg-dark-accent transition-colors">
                    {/* ✅ Круглая иконка: Логотип или первая буква */}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 border border-[#E8E2D5] dark:border-dark-border overflow-hidden bg-white dark:bg-dark-card ${
                      !brand.logo_url && (brand.is_active
                        ? 'text-[#C9A961] dark:text-gold font-bold text-lg'
                        : 'text-[#8A8275] dark:text-gray-400 font-bold text-lg')
                    }`}>
                      {brand.logo_url ? (
                        <img src={brand.logo_url} alt={safeName} className="w-full h-full object-contain p-1.5" />
                      ) : (
                        safeName.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="flex-1 min-w-[120px]">
                      <p className={`font-bold truncate ${brand.is_active ? 'text-[#1B2A4A] dark:text-white' : 'text-[#8A8275] dark:text-gray-400 line-through'}`}>
                        {safeName}
                      </p>
                      <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">
                        {t("Создан:")}{' '}{new Date(brand.created_at).toLocaleDateString(getAdminLocale())}
                      </p>
                    </div>

                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 ${
                      brand.is_active
                        ? 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-500/30'
                        : 'bg-gray-100 dark:bg-gray-500/20 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-500/30'
                    }`}>
                      {brand.is_active?t("✓ Активен"):t("✕ Неактивен")}
                    </span>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleToggleBrand(brand)}
                        title={brand.is_active?t("Деактивировать"):t("Активировать")}
                        className={`p-2.5 rounded-xl border transition-colors ${
                          brand.is_active
                            ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-500/20'
                            : 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-500/20'
                        }`}
                      >
                        {brand.is_active ? <XCircle size={16} /> : <Check size={16} />}
                      </button>
                      <button
                        onClick={() => setEditingBrand(brand)}
                        title={t("Редактировать")}
                        className="p-2.5 rounded-xl bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white hover:bg-[#E8E2D5] dark:hover:bg-dark-border transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteBrand(brand)}
                        title={t("Удалить")}
                        className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-[#9B3B3B] dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border overflow-hidden">
          <div className="flex items-center gap-3 p-5 border-b border-[#E8E2D5] dark:border-dark-border">
            <div className="w-10 h-10 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
              <Info size={18} className="text-[#1B2A4A] dark:text-white" />
            </div>
            <div className="flex-1 min-w-[120px]">
              <h2 className="text-lg font-bold text-[#1B2A4A] dark:text-white">{t("Как это работает")}</h2>
              <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">{t("Подсказки по управлению брендами")}</p>
            </div>
          </div>
          <div className="divide-y divide-[#E8E2D5] dark:divide-dark-border">
            {[
              { icon: TipCheck, text: 'Активные бренды показываются в приложении клиентам' },
              { icon: TipClose, text: 'Неактивные бренды скрыты из каталога, но товары остаются' },
              { icon: TipTrash, text: 'Удаление бренда не удаляет связанные товары' },
              { icon: TipImage, text: 'Для логотипа вставьте прямую ссылку на изображение (PNG/JPG с прозрачным фоном)' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5">
                <div className="w-9 h-9 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
                  <item.icon size={16} />
                </div>
                <p className="flex-1 text-sm text-[#1B2A4A] dark:text-white pt-1.5">{tx(item.text)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ Модалка добавления бренда */}
      {showAddModal && (
        <div className="loft-modal fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setShowAddModal(false); setNewBrandName(''); setNewBrandLogo('') }}>
          <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-2 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center">
                  <Plus size={18} className="text-[#C9A961]" />
                </div>
                <h2 className="text-xl font-bold text-[#1B2A4A] dark:text-white">{t("Добавить бренд")}</h2>
              </div>
              <button onClick={() => { setShowAddModal(false); setNewBrandName(''); setNewBrandLogo('') }} className="p-2 rounded-lg hover:bg-[#F5F1E8] dark:hover:bg-dark-accent text-[#8A8275] dark:text-gray-300 transition-colors">
                <X size={18} />
              </button>
            </div>

            <label className="text-xs text-[#8A8275] dark:text-gray-300 block mb-1.5">{t("Название бренда *")}</label>
            <input
              type="text"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              placeholder={t("Например: Nike")}
              className="w-full px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl mb-4 bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white placeholder:text-[#8A8275] dark:placeholder:text-gray-500 focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold text-sm font-medium"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddBrand()}
            />

            <label className="text-xs text-[#8A8275] dark:text-gray-300 block mb-1.5 flex items-center gap-1.5">
              <ImageIcon size={12} /> {' '}{t("Ссылка на логотип (необязательно)")}</label>
            <input
              type="text"
              value={newBrandLogo}
              onChange={(e) => setNewBrandLogo(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl mb-5 bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white placeholder:text-[#8A8275] dark:placeholder:text-gray-500 focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold text-sm font-mono"
              onKeyDown={(e) => e.key === 'Enter' && handleAddBrand()}
            />

            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleAddBrand} className="px-4 py-3 rounded-xl bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A] font-bold hover:bg-[#142038] dark:hover:bg-[#d6b57e] transition-colors">{t("Добавить")}</button>
              <button onClick={() => { setShowAddModal(false); setNewBrandName(''); setNewBrandLogo('') }} className="px-4 py-3 rounded-xl bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white font-bold hover:bg-[#E8E2D5] dark:hover:bg-dark-border transition-colors">{t("Отмена")}</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Модалка редактирования бренда */}
      {editingBrand && (
        <div className="loft-modal fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditingBrand(null)}>
          <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-2 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center">
                  <Edit2 size={18} className="text-[#C9A961]" />
                </div>
                <h2 className="text-xl font-bold text-[#1B2A4A] dark:text-white">{t("Редактировать бренд")}</h2>
              </div>
              <button onClick={() => setEditingBrand(null)} className="p-2 rounded-lg hover:bg-[#F5F1E8] dark:hover:bg-dark-accent text-[#8A8275] dark:text-gray-300 transition-colors">
                <X size={18} />
              </button>
            </div>

            <label className="text-xs text-[#8A8275] dark:text-gray-300 block mb-1.5">{t("Название бренда *")}</label>
            <input
              type="text"
              value={editingBrand.name}
              onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
              placeholder={t("Название бренда")}
              className="w-full px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl mb-4 bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white placeholder:text-[#8A8275] dark:placeholder:text-gray-500 focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold text-sm font-medium"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleEditBrand()}
            />

            <label className="text-xs text-[#8A8275] dark:text-gray-300 block mb-1.5 flex items-center gap-1.5">
              <ImageIcon size={12} /> {' '}{t("Ссылка на логотип")}</label>
            <input
              type="text"
              value={editingBrand.logo_url || ''}
              onChange={(e) => setEditingBrand({ ...editingBrand, logo_url: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="w-full px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl mb-5 bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white placeholder:text-[#8A8275] dark:placeholder:text-gray-500 focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold text-sm font-mono"
              onKeyDown={(e) => e.key === 'Enter' && handleEditBrand()}
            />

            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleEditBrand} className="px-4 py-3 rounded-xl bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A] font-bold hover:bg-[#142038] dark:hover:bg-[#d6b57e] transition-colors">{t("Сохранить")}</button>
              <button onClick={() => setEditingBrand(null)} className="px-4 py-3 rounded-xl bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white font-bold hover:bg-[#E8E2D5] dark:hover:bg-dark-border transition-colors">{t("Отмена")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
