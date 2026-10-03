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
} from 'lucide-react'
import { toast, Toaster } from 'sonner'

interface Brand {
  id: string
  name: string
  is_active: boolean
  created_at: string
}

export default function BrandsPage() {
  const navigate = useNavigate()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newBrandName, setNewBrandName] = useState('')
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)

  useEffect(() => {
    loadBrands(false)
  }, [])

  const loadBrands = async (forceRefresh = false) => {
    // ✅ Проверяем кеш
    if (!forceRefresh) {
      const cached = brandsCacheApi.get()
      if (cached) {
        setBrands(cached as Brand[])
        setLoading(false)
        return
      }
    }

    if (forceRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name')
      if (error) throw error
      
      const brandsList = data || []
      setBrands(brandsList)
      
      // ✅ Сохраняем в кеш
      brandsCacheApi.set(brandsList)
    } catch (error) {
      console.error('Ошибка загрузки брендов:', error)
      toast.error('Ошибка загрузки брендов')
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
      toast.error('Введите название бренда')
      return
    }
    try {
      const { error } = await supabase
        .from('brands')
        .insert({
          name: newBrandName.trim(),
          is_active: true
        })
      if (error) throw error
      toast.success('Бренд добавлен!')
      setNewBrandName('')
      setShowAddModal(false)
      
      // ✅ Сбрасываем кеш и перезагружаем
      brandsCacheApi.invalidate()
      await loadBrands(true)
    } catch (error: any) {
      console.error('Ошибка добавления:', error)
      if (error.code === '23505') {
        toast.error('Такой бренд уже существует')
      } else {
        toast.error('Ошибка добавления бренда')
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
      toast.success(brand.is_active ? 'Бренд деактивирован' : 'Бренд активирован')
      
      // ✅ Сбрасываем кеш и перезагружаем
      brandsCacheApi.invalidate()
      await loadBrands(true)
    } catch (error) {
      console.error('Ошибка обновления:', error)
      toast.error('Ошибка обновления')
    }
  }

  const handleDeleteBrand = async (brand: Brand) => {
    if (!confirm(`Удалить бренд "${brand.name}"?`)) return
    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', brand.id)
      if (error) throw error
      toast.success('Бренд удалён')
      
      // ✅ Сбрасываем кеш и перезагружаем
      brandsCacheApi.invalidate()
      await loadBrands(true)
    } catch (error) {
      console.error('Ошибка удаления:', error)
      toast.error('Ошибка удаления')
    }
  }

  const handleEditBrand = async () => {
    if (!editingBrand || !editingBrand.name.trim()) {
      toast.error('Введите название бренда')
      return
    }
    try {
      const { error } = await supabase
        .from('brands')
        .update({ name: editingBrand.name.trim() })
        .eq('id', editingBrand.id)
      if (error) throw error
      toast.success('Бренд обновлён')
      setEditingBrand(null)
      
      // ✅ Сбрасываем кеш и перезагружаем
      brandsCacheApi.invalidate()
      await loadBrands(true)
    } catch (error: any) {
      console.error('Ошибка обновления:', error)
      if (error.code === '23505') {
        toast.error('Такой бренд уже существует')
      } else {
        toast.error('Ошибка обновления')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg flex items-center justify-center">
        <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B2A4A] dark:border-gold mx-auto mb-4"></div>
          <p className="text-[#1B2A4A] dark:text-white font-medium">Загрузка брендов...</p>
        </div>
      </div>
    )
  }

  const activeCount = brands.filter(b => b.is_active).length

  return (
    <div className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg">
      <Toaster position="top-center" richColors />

      {/* ✅ Sticky-шапка: назад слева, заголовок + счётчик + кнопка "Добавить" справа */}
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
              На главную
            </button>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#1B2A4A] dark:text-white">Бренды</h1>
              <span className="w-10 h-10 rounded-full bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center">
                <Tag size={18} className="text-[#C9A961]" />
              </span>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A] hover:bg-[#142038] dark:hover:bg-[#d6b57e] transition-colors"
            >
              <Plus size={16} />
              Добавить
            </button>
          </div>

          {/* Статистика + кнопка обновления */}
          <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-4 py-2 rounded-xl text-sm font-bold bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white">
                Всего: <span className="text-[#C9A961]">{brands.length}</span>
              </span>
              <span className="px-4 py-2 rounded-xl text-sm font-bold bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-500/30">
                Активных: {activeCount}
              </span>
              <span className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 dark:bg-gray-500/20 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-500/30">
                Неактивных: {brands.length - activeCount}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[#1B2A4A] dark:text-white bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border hover:bg-[#F5F1E8] dark:hover:bg-dark-accent transition-colors disabled:opacity-50"
              title="Обновить список"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Обновить
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-4">
        {/* ✅ Карточка со списком брендов */}
        <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border overflow-hidden">
          {/* Шапка секции */}
          <div className="flex items-center gap-3 p-5 border-b border-[#E8E2D5] dark:border-dark-border">
            <div className="w-10 h-10 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
              <Tag size={18} className="text-[#C9A961]" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-[#1B2A4A] dark:text-white">Все бренды</h2>
              <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">
                Управление списком брендов магазина
              </p>
            </div>
          </div>

          {/* Список брендов */}
          <div className="divide-y divide-[#E8E2D5] dark:divide-dark-border">
            {brands.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-14 h-14 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border mx-auto mb-3 flex items-center justify-center">
                  <Tag size={24} className="text-[#8A8275] dark:text-gray-300" />
                </div>
                <p className="text-sm font-medium text-[#1B2A4A] dark:text-white mb-1">
                  Брендов пока нет
                </p>
                <p className="text-xs text-[#8A8275] dark:text-gray-300">
                  Добавьте первый бренд, чтобы начать
                </p>
              </div>
            ) : (
              brands.map((brand) => (
                <div
                  key={brand.id}
                  className="flex items-center gap-4 p-4 hover:bg-[#F5F1E8] dark:hover:bg-dark-accent transition-colors"
                >
                  {/* Круглая иконка с первой буквой бренда */}
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 border border-[#E8E2D5] dark:border-dark-border font-bold text-lg ${
                    brand.is_active
                      ? 'bg-[#C9A961]/10 dark:bg-gold/20 text-[#C9A961] dark:text-gold'
                      : 'bg-[#F5F1E8] dark:bg-dark-accent text-[#8A8275] dark:text-gray-400'
                  }`}>
                    {brand.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Название + дата */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold truncate ${
                      brand.is_active
                        ? 'text-[#1B2A4A] dark:text-white'
                        : 'text-[#8A8275] dark:text-gray-400 line-through'
                    }`}>
                      {brand.name}
                    </p>
                    <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">
                      Создан: {new Date(brand.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>

                  {/* Пилла статуса */}
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 ${
                    brand.is_active
                      ? 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-500/30'
                      : 'bg-gray-100 dark:bg-gray-500/20 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-500/30'
                  }`}>
                    {brand.is_active ? '✓ Активен' : '✕ Неактивен'}
                  </span>

                  {/* Кнопки действий */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleToggleBrand(brand)}
                      title={brand.is_active ? 'Деактивировать' : 'Активировать'}
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
                      title="Редактировать"
                      className="p-2.5 rounded-xl bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white hover:bg-[#E8E2D5] dark:hover:bg-dark-border transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteBrand(brand)}
                      title="Удалить"
                      className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-[#9B3B3B] dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ✅ Карточка с подсказками */}
        <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border overflow-hidden">
          <div className="flex items-center gap-3 p-5 border-b border-[#E8E2D5] dark:border-dark-border">
            <div className="w-10 h-10 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
              <Info size={18} className="text-[#1B2A4A] dark:text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-[#1B2A4A] dark:text-white">Как это работает</h2>
              <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">
                Подсказки по управлению брендами
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#E8E2D5] dark:divide-dark-border">
            {[
              { icon: '✓', text: 'Активные бренды показываются в приложении клиентам' },
              { icon: '✕', text: 'Неактивные бренды скрыты из каталога, но товары остаются' },
              { icon: '🗑', text: 'Удаление бренда не удаляет связанные товары' },
              { icon: '🔄', text: 'Изменения применяются мгновенно во всём приложении' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5">
                <div className="w-9 h-9 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
                  <span className="text-base">{item.icon}</span>
                </div>
                <p className="flex-1 text-sm text-[#1B2A4A] dark:text-white pt-1.5">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ Модалка добавления бренда */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowAddModal(false)
            setNewBrandName('')
          }}
        >
          <div
            className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center">
                  <Plus size={18} className="text-[#C9A961]" />
                </div>
                <h2 className="text-xl font-bold text-[#1B2A4A] dark:text-white">
                  Добавить бренд
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewBrandName('')
                }}
                className="p-2 rounded-lg hover:bg-[#F5F1E8] dark:hover:bg-dark-accent text-[#8A8275] dark:text-gray-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <label className="text-xs text-[#8A8275] dark:text-gray-300 block mb-1.5">
              Название бренда
            </label>
            <input
              type="text"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              placeholder="Например: Nike"
              className="w-full px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl mb-5 bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white placeholder:text-[#8A8275] dark:placeholder:text-gray-500 focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold text-sm font-medium"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddBrand()}
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAddBrand}
                className="px-4 py-3 rounded-xl bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A] font-bold hover:bg-[#142038] dark:hover:bg-[#d6b57e] transition-colors"
              >
                Добавить
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewBrandName('')
                }}
                className="px-4 py-3 rounded-xl bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white font-bold hover:bg-[#E8E2D5] dark:hover:bg-dark-border transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Модалка редактирования бренда */}
      {editingBrand && (
        <div
          className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setEditingBrand(null)}
        >
          <div
            className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center">
                  <Edit2 size={18} className="text-[#C9A961]" />
                </div>
                <h2 className="text-xl font-bold text-[#1B2A4A] dark:text-white">
                  Редактировать бренд
                </h2>
              </div>
              <button
                onClick={() => setEditingBrand(null)}
                className="p-2 rounded-lg hover:bg-[#F5F1E8] dark:hover:bg-dark-accent text-[#8A8275] dark:text-gray-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <label className="text-xs text-[#8A8275] dark:text-gray-300 block mb-1.5">
              Название бренда
            </label>
            <input
              type="text"
              value={editingBrand.name}
              onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
              placeholder="Название бренда"
              className="w-full px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl mb-5 bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white placeholder:text-[#8A8275] dark:placeholder:text-gray-500 focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold text-sm font-medium"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleEditBrand()}
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleEditBrand}
                className="px-4 py-3 rounded-xl bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A] font-bold hover:bg-[#142038] dark:hover:bg-[#d6b57e] transition-colors"
              >
                Сохранить
              </button>
              <button
                onClick={() => setEditingBrand(null)}
                className="px-4 py-3 rounded-xl bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white font-bold hover:bg-[#E8E2D5] dark:hover:bg-dark-border transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}