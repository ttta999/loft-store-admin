import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  fetchCategoriesTree,
  invalidateCategoriesCache,
  logCategoryChange,
  slugify,
  type CategoryTree,
  type SubcategoryRow,
} from '../lib/categories'
import { categoriesCacheApi } from '../lib/cache'
import { toast, Toaster } from 'sonner'
import {
  ArrowLeft,
  RefreshCw,
  Plus,
  Edit2,
  Tag,
  Ruler,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  X,
  Layers,
  Info,
} from 'lucide-react'

const SIZE_TYPES = [
  { value: 'numeric', label: 'Числовая (38–47)' },
  { value: 'alphabetical', label: 'Буквенная (XS–XXL)' },
  { value: 'combined', label: 'Смешанная (44–56 + XS–XXL)' },
  { value: 'one_size', label: 'One Size' },
]

export default function CategoriesPage() {
  const navigate = useNavigate()
  const [tree, setTree] = useState<CategoryTree[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Модалки
  const [categoryModal, setCategoryModal] = useState<{ mode: 'create' } | { mode: 'edit'; category: CategoryTree } | null>(null)
  const [subModal, setSubModal] = useState<{ mode: 'create'; categoryId: string } | { mode: 'edit'; categoryId: string; sub: SubcategoryRow } | null>(null)

  useEffect(() => {
    load(false)
  }, [])

  const load = async (force: boolean) => {
    if (force) setRefreshing(true)
    else setLoading(true)
    try {
      const data = await fetchCategoriesTree(force)
      setTree(data)
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error)
      toast.error('Ошибка загрузки категорий')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    invalidateCategoriesCache()
    load(true)
  }

  // ========== СОХРАНЕНИЕ КАТЕГОРИИ ==========
  const saveCategory = async (values: { id: string; name_ru: string; name_uz: string; icon: string }, editId: string | null) => {
    try {
      if (editId) {
        const old = tree.find(c => c.id === editId)
        const { error } = await supabase
          .from('categories')
          .update({ name_ru: values.name_ru, name_uz: values.name_uz, icon: values.icon, updated_at: new Date().toISOString() })
          .eq('id', editId)
        if (error) throw error
        await logCategoryChange('update_category', 'category', editId, {
          name_ru: { old: old?.name_ru, new: values.name_ru },
          name_uz: { old: old?.name_uz, new: values.name_uz },
          icon: { old: old?.icon, new: values.icon },
        })
        toast.success('Категория обновлена ✅')
      } else {
        const { error } = await supabase
          .from('categories')
          .insert({ id: values.id, name_ru: values.name_ru, name_uz: values.name_uz, icon: values.icon, sort_order: tree.length + 1 })
        if (error) throw error
        await logCategoryChange('create_category', 'category', values.id, { snapshot: values })
        toast.success('Категория добавлена ✅')
      }
      setCategoryModal(null)
      invalidateCategoriesCache()
      await load(true)
    } catch (error: any) {
      console.error(error)
      toast.error(error?.code === '23505' ? 'Категория с таким ID уже существует' : 'Ошибка сохранения')
    }
  }

  // ========== СОХРАНЕНИЕ ПОДКАТЕГОРИИ ==========
  const saveSubcategory = async (
    values: { id: string; name_ru: string; name_uz: string; size_type: string; sizes: string[] },
    categoryId: string,
    editId: string | null
  ) => {
    try {
      if (editId) {
        const { error } = await supabase
          .from('subcategories')
          .update({ name_ru: values.name_ru, name_uz: values.name_uz, size_type: values.size_type, sizes: values.sizes, updated_at: new Date().toISOString() })
          .eq('id', editId)
        if (error) throw error
        await logCategoryChange('update_subcategory', 'subcategory', editId, { snapshot: values })
        toast.success('Подкатегория обновлена ✅')
      } else {
        const { error } = await supabase
          .from('subcategories')
          .insert({ id: values.id, category_id: categoryId, name_ru: values.name_ru, name_uz: values.name_uz, size_type: values.size_type, sizes: values.sizes, sort_order: 999 })
        if (error) throw error
        await logCategoryChange('create_subcategory', 'subcategory', values.id, { snapshot: values })
        toast.success('Подкатегория добавлена ✅')
      }
      setSubModal(null)
      invalidateCategoriesCache()
      await load(true)
    } catch (error: any) {
      console.error(error)
      toast.error(error?.code === '23505' ? 'Подкатегория с таким ID уже существует' : 'Ошибка сохранения')
    }
  }

  // ========== ВКЛ/ВЫКЛ ==========
  const toggleCategory = async (category: CategoryTree) => {
    const turningOff = category.is_active
    if (turningOff) {
      const ok = confirm(
        `Отключить категорию «${category.name_ru}»?\n\nОна скроется из приложения вместе со всеми товарами (${category.subcategories.length} подкатегорий). В админке категория останется с пометкой «Отключена».`
      )
      if (!ok) return
    }
    try {
      const { error } = await supabase.from('categories').update({ is_active: !category.is_active, updated_at: new Date().toISOString() }).eq('id', category.id)
      if (error) throw error
      await logCategoryChange(turningOff ? 'disable_category' : 'enable_category', 'category', category.id)
      toast.success(turningOff ? 'Категория отключена 🙈' : 'Категория включена ✅')
      invalidateCategoriesCache()
      await load(true)
    } catch (error) {
      console.error(error)
      toast.error('Ошибка обновления')
    }
  }

  const toggleSubcategory = async (sub: SubcategoryRow) => {
    const turningOff = sub.is_active
    if (turningOff) {
      const ok = confirm(`Отключить подкатегорию «${sub.name_ru}»? Товары в ней скроются из приложения.`)
      if (!ok) return
    }
    try {
      const { error } = await supabase.from('subcategories').update({ is_active: !sub.is_active, updated_at: new Date().toISOString() }).eq('id', sub.id)
      if (error) throw error
      await logCategoryChange(turningOff ? 'disable_subcategory' : 'enable_subcategory', 'subcategory', sub.id)
      toast.success(turningOff ? 'Подкатегория отключена 🙈' : 'Подкатегория включена ✅')
      invalidateCategoriesCache()
      await load(true)
    } catch (error) {
      console.error(error)
      toast.error('Ошибка обновления')
    }
  }

  // ========== СОРТИРОВКА СТРЕЛКАМИ ==========
  const moveCategory = async (index: number, dir: -1 | 1) => {
    const j = index + dir
    if (j < 0 || j >= tree.length) return
    const list = [...tree]
    ;[list[index], list[j]] = [list[j], list[index]]
    setTree(list)
    await Promise.all(list.map((c, i) => supabase.from('categories').update({ sort_order: i + 1 }).eq('id', c.id)))
    // ✅ Обновляем кеш сразу (без invalidate, чтобы не делать лишний запрос)
    categoriesCacheSilentSet(list)
  }

  const moveSubcategory = async (category: CategoryTree, index: number, dir: -1 | 1) => {
    const j = index + dir
    if (j < 0 || j >= category.subcategories.length) return
    const subs = [...category.subcategories]
    ;[subs[index], subs[j]] = [subs[j], subs[index]]
    const newTree = tree.map(c => (c.id === category.id ? { ...c, subcategories: subs } : c))
    setTree(newTree)
    await Promise.all(subs.map((s, i) => supabase.from('subcategories').update({ sort_order: i + 1 }).eq('id', s.id)))
    // ✅ Обновляем кеш сразу (без invalidate, чтобы не делать лишний запрос)
    categoriesCacheSilentSet(newTree)
  }

  // ✅ Тихо обновляем кеш после сортировки (без повторного запроса к БД)
  const categoriesCacheSilentSet = (list: CategoryTree[]) => {
    categoriesCacheApi.set(list)
  }

  const activeCategories = tree.filter(c => c.is_active).length
  const activeSubs = tree.reduce((sum, c) => sum + c.subcategories.filter(s => s.is_active).length, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg flex items-center justify-center">
        <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B2A4A] dark:border-gold mx-auto mb-4"></div>
          <p className="text-[#1B2A4A] dark:text-white font-medium">Загрузка категорий...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg">
      <Toaster position="top-center" richColors />

      {/* ✅ Sticky-шапка */}
      <div className="sticky top-0 z-20 bg-[#F5F1E8]/95 dark:bg-dark-bg/95 backdrop-blur-sm border-b border-[#E8E2D5] dark:border-dark-border px-6 py-4">
        <div className="max-w-5xl mx-auto">
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
              <h1 className="text-2xl font-bold text-[#1B2A4A] dark:text-white">Категории</h1>
              <span className="w-10 h-10 rounded-full bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center">
                <Layers size={18} className="text-[#C9A961]" />
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[#1B2A4A] dark:text-white bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border hover:bg-[#F5F1E8] dark:hover:bg-dark-accent transition-colors disabled:opacity-50"
                title="Обновить"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => setCategoryModal({ mode: 'create' })}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A] hover:bg-[#142038] dark:hover:bg-[#d6b57e] transition-colors"
              >
                <Plus size={16} />
                Категория
              </button>
            </div>
          </div>

          {/* Статистика */}
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <span className="px-4 py-2 rounded-xl text-sm font-bold bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white">
              Категорий: <span className="text-[#C9A961]">{tree.length}</span> · активных {activeCategories}
            </span>
            <span className="px-4 py-2 rounded-xl text-sm font-bold bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white">
              Подкатегорий: <span className="text-[#C9A961]">{activeSubs}</span> активных
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-4">
        {tree.length === 0 ? (
          <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border mx-auto mb-4 flex items-center justify-center">
              <Layers size={28} className="text-[#8A8275] dark:text-gray-300" />
            </div>
            <p className="text-base font-medium text-[#1B2A4A] dark:text-white mb-1">Категорий пока нет</p>
            <p className="text-sm text-[#8A8275] dark:text-gray-300">Добавьте первую категорию</p>
          </div>
        ) : (
          tree.map((category, catIndex) => (
            <div
              key={category.id}
              className={`bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border overflow-hidden ${
                category.is_active
                  ? 'border-[#E8E2D5] dark:border-dark-border'
                  : 'border-[#C9A961] dark:border-gold opacity-75'
              }`}
            >
              {/* ✅ Шапка категории */}
              <div className="flex items-center gap-4 p-4 border-b border-[#E8E2D5] dark:border-dark-border">
                <div className="w-11 h-11 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0 text-xl">
                  {category.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-[#1B2A4A] dark:text-white">{category.name_ru}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      category.is_active
                        ? 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300'
                        : 'bg-[#C9A961]/20 dark:bg-gold/30 text-[#C9A961] dark:text-gold'
                    }`}>
                      {category.is_active ? '✓ Активна' : '🙈 Отключена'}
                    </span>
                  </div>
                  <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">
                    {category.name_uz} · {category.subcategories.length} подкатегорий · ID: {category.id}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => moveCategory(catIndex, -1)} disabled={catIndex === 0} title="Выше"
                    className="p-2 rounded-lg bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white hover:bg-[#E8E2D5] dark:hover:bg-dark-border disabled:opacity-40 transition-colors">
                    <ChevronUp size={14} />
                  </button>
                  <button onClick={() => moveCategory(catIndex, 1)} disabled={catIndex === tree.length - 1} title="Ниже"
                    className="p-2 rounded-lg bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white hover:bg-[#E8E2D5] dark:hover:bg-dark-border disabled:opacity-40 transition-colors">
                    <ChevronDown size={14} />
                  </button>
                  <button onClick={() => setCategoryModal({ mode: 'edit', category })} title="Редактировать"
                    className="p-2 rounded-lg bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white hover:bg-[#E8E2D5] dark:hover:bg-dark-border transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => toggleCategory(category)} title={category.is_active ? 'Отключить' : 'Включить'}
                    className={`p-2 rounded-lg border transition-colors ${
                      category.is_active
                        ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-500/20'
                        : 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-500/20'
                    }`}>
                    {category.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* ✅ Подкатегории */}
              <div className="divide-y divide-[#E8E2D5] dark:divide-dark-border">
                {category.subcategories.map((sub, subIndex) => (
                  <div key={sub.id} className={`flex items-center gap-4 p-3.5 ${!sub.is_active ? 'opacity-60' : ''}`}>
                    <div className="w-9 h-9 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
                      <Ruler size={14} className="text-[#1B2A4A] dark:text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-[#1B2A4A] dark:text-white">{sub.name_ru}</p>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border text-[#8A8275] dark:text-gray-300">
                          {SIZE_TYPES.find(t => t.value === sub.size_type)?.label || sub.size_type}
                        </span>
                        {!sub.is_active && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C9A961]/20 dark:bg-gold/30 text-[#C9A961] dark:text-gold">
                            🙈 Отключена
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5 truncate">
                        {sub.name_uz}
                        {sub.sizes.length > 0 && ` · ${sub.sizes.slice(0, 6).join(', ')}${sub.sizes.length > 6 ? ` +${sub.sizes.length - 6}` : ''}`}
                        {sub.sizes.length === 0 && ' · без размеров'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => moveSubcategory(category, subIndex, -1)} disabled={subIndex === 0} title="Выше"
                        className="p-1.5 rounded-lg bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white hover:bg-[#E8E2D5] dark:hover:bg-dark-border disabled:opacity-40 transition-colors">
                        <ChevronUp size={13} />
                      </button>
                      <button onClick={() => moveSubcategory(category, subIndex, 1)} disabled={subIndex === category.subcategories.length - 1} title="Ниже"
                        className="p-1.5 rounded-lg bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white hover:bg-[#E8E2D5] dark:hover:bg-dark-border disabled:opacity-40 transition-colors">
                        <ChevronDown size={13} />
                      </button>
                      <button onClick={() => setSubModal({ mode: 'edit', categoryId: category.id, sub })} title="Редактировать"
                        className="p-1.5 rounded-lg bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white hover:bg-[#E8E2D5] dark:hover:bg-dark-border transition-colors">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => toggleSubcategory(sub)} title={sub.is_active ? 'Отключить' : 'Включить'}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          sub.is_active
                            ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30 text-orange-700 dark:text-orange-300'
                            : 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-300'
                        }`}>
                        {sub.is_active ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Кнопка добавить подкатегорию */}
                <button
                  onClick={() => setSubModal({ mode: 'create', categoryId: category.id })}
                  className="w-full flex items-center justify-center gap-2 p-3 text-sm font-bold text-[#8A8275] dark:text-gray-300 hover:bg-[#F5F1E8] dark:hover:bg-dark-accent hover:text-[#1B2A4A] dark:hover:text-white transition-colors"
                >
                  <Plus size={14} />
                  Добавить подкатегорию
                </button>
              </div>
            </div>
          ))
        )}

        {/* ✅ Подсказка про отключение */}
        <div className="flex items-center gap-3 p-4 bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border rounded-2xl">
          <div className="w-9 h-9 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
            <Info size={16} className="text-[#1B2A4A] dark:text-white" />
          </div>
          <p className="text-xs text-[#8A8275] dark:text-gray-300 leading-relaxed">
            Категории не удаляются — только отключаются. Отключённая категория скрывается из приложения вместе со своими товарами, но остаётся здесь для истории. Все изменения логируются (кто и когда).
          </p>
        </div>
      </div>

      {/* ✅ МОДАЛКА КАТЕГОРИИ */}
      {categoryModal && (
        <CategoryModal
          initial={categoryModal.mode === 'edit' ? categoryModal.category : null}
          existingIds={tree.map(c => c.id)}
          onClose={() => setCategoryModal(null)}
          onSave={saveCategory}
        />
      )}

      {/* ✅ МОДАЛКА ПОДКАТЕГОРИИ */}
      {subModal && (
        <SubcategoryModal
          categoryId={subModal.categoryId}
          initial={subModal.mode === 'edit' ? subModal.sub : null}
          existingIds={tree.flatMap(c => c.subcategories.map(s => s.id))}
          onClose={() => setSubModal(null)}
          onSave={saveSubcategory}
        />
      )}
    </div>
  )
}

// ========== МОДАЛКА КАТЕГОРИИ ==========
function CategoryModal({ initial, existingIds, onClose, onSave }: {
  initial: CategoryTree | null
  existingIds: string[]
  onClose: () => void
  onSave: (values: { id: string; name_ru: string; name_uz: string; icon: string }, editId: string | null) => void
}) {
  const [nameRu, setNameRu] = useState(initial?.name_ru || '')
  const [nameUz, setNameUz] = useState(initial?.name_uz || '')
  const [icon, setIcon] = useState(initial?.icon || '📦')
  const [id, setId] = useState(initial?.id || '')
  const [idTouched, setIdTouched] = useState(!!initial)

  const handleNameRuChange = (value: string) => {
    setNameRu(value)
    if (!idTouched) {
      setId(slugify(value))
    }
  }

  const submit = () => {
    if (!nameRu.trim()) {
      toast.error('Укажите название (RU)')
      return
    }
    const finalId = (id.trim() || slugify(nameRu)).toLowerCase()
    if (!initial && existingIds.includes(finalId)) {
      toast.error('Категория с таким ID уже существует')
      return
    }
    onSave({ id: finalId, name_ru: nameRu.trim(), name_uz: nameUz.trim() || nameRu.trim(), icon: icon.trim() || '📦' }, initial?.id || null)
  }

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-2 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center">
              <Tag size={18} className="text-[#C9A961]" />
            </div>
            <h3 className="text-xl font-bold text-[#1B2A4A] dark:text-white">
              {initial ? 'Редактировать категорию' : 'Новая категория'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F5F1E8] dark:hover:bg-dark-accent text-[#8A8275] dark:text-gray-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-[80px_1fr] gap-3">
            <div>
              <label className="text-xs font-bold text-[#8A8275] dark:text-gray-300 uppercase tracking-wider mb-1.5 block">Иконка</label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={4}
                className="w-full px-3 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl bg-white dark:bg-dark-accent text-center text-xl focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#8A8275] dark:text-gray-300 uppercase tracking-wider mb-1.5 block">Название RU *</label>
              <input
                type="text"
                value={nameRu}
                onChange={(e) => handleNameRuChange(e.target.value)}
                placeholder="Например: Обувь"
                className="w-full px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#8A8275] dark:text-gray-300 uppercase tracking-wider mb-1.5 block">Название UZ</label>
            <input
              type="text"
              value={nameUz}
              onChange={(e) => setNameUz(e.target.value)}
              placeholder="Если пусто — будет как RU"
              className="w-full px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold text-sm font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#8A8275] dark:text-gray-300 uppercase tracking-wider mb-1.5 block">
              ID (slug) {initial && '· не изменяется'}
            </label>
            <input
              type="text"
              value={id}
              onChange={(e) => { setIdTouched(true); setId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')) }}
              disabled={!!initial}
              placeholder="shoes"
              className="w-full px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold text-sm font-mono disabled:opacity-60"
            />
            <p className="text-xs text-[#8A8275] dark:text-gray-400 mt-1">Генерируется автоматически из названия, можно поменять до сохранения</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-3 rounded-xl bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white font-bold hover:bg-[#E8E2D5] dark:hover:bg-dark-border transition-colors">
            Отмена
          </button>
          <button onClick={submit} className="px-4 py-3 rounded-xl bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A] font-bold hover:bg-[#142038] dark:hover:bg-[#d6b57e] transition-colors">
            {initial ? 'Сохранить' : 'Добавить'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ========== МОДАЛКА ПОДКАТЕГОРИИ ==========
function SubcategoryModal({ categoryId, initial, existingIds, onClose, onSave }: {
  categoryId: string
  initial: SubcategoryRow | null
  existingIds: string[]
  onClose: () => void
  onSave: (values: { id: string; name_ru: string; name_uz: string; size_type: string; sizes: string[] }, categoryId: string, editId: string | null) => void
}) {
  const [nameRu, setNameRu] = useState(initial?.name_ru || '')
  const [nameUz, setNameUz] = useState(initial?.name_uz || '')
  const [sizeType, setSizeType] = useState(initial?.size_type || 'numeric')
  const [sizes, setSizes] = useState<string[]>(initial?.sizes || [])
  const [newSize, setNewSize] = useState('')
  const [id, setId] = useState(initial?.id || '')
  const [idTouched, setIdTouched] = useState(!!initial)

  const handleNameRuChange = (value: string) => {
    setNameRu(value)
    if (!idTouched) setId(slugify(value))
  }

  const addSize = () => {
    const v = newSize.trim()
    if (!v) return
    if (sizes.includes(v)) {
      toast.error('Такой размер уже добавлен')
      return
    }
    setSizes([...sizes, v])
    setNewSize('')
  }

  const submit = () => {
    if (!nameRu.trim()) {
      toast.error('Укажите название (RU)')
      return
    }
    const finalId = (id.trim() || slugify(nameRu)).toLowerCase()
    if (!initial && existingIds.includes(finalId)) {
      toast.error('Подкатегория с таким ID уже существует')
      return
    }
    onSave(
      { id: finalId, name_ru: nameRu.trim(), name_uz: nameUz.trim() || nameRu.trim(), size_type: sizeType, sizes },
      categoryId,
      initial?.id || null
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-2 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center">
              <Ruler size={18} className="text-[#C9A961]" />
            </div>
            <h3 className="text-xl font-bold text-[#1B2A4A] dark:text-white">
              {initial ? 'Редактировать подкатегорию' : 'Новая подкатегория'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F5F1E8] dark:hover:bg-dark-accent text-[#8A8275] dark:text-gray-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#8A8275] dark:text-gray-300 uppercase tracking-wider mb-1.5 block">Название RU *</label>
              <input
                type="text"
                value={nameRu}
                onChange={(e) => handleNameRuChange(e.target.value)}
                placeholder="Например: Кроссовки"
                className="w-full px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold text-sm font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#8A8275] dark:text-gray-300 uppercase tracking-wider mb-1.5 block">Название UZ</label>
              <input
                type="text"
                value={nameUz}
                onChange={(e) => setNameUz(e.target.value)}
                placeholder="Если пусто — будет как RU"
                className="w-full px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#8A8275] dark:text-gray-300 uppercase tracking-wider mb-1.5 block">
              ID (slug) {initial && '· не изменяется'}
            </label>
            <input
              type="text"
              value={id}
              onChange={(e) => { setIdTouched(true); setId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')) }}
              disabled={!!initial}
              placeholder="sneakers"
              className="w-full px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold text-sm font-mono disabled:opacity-60"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#8A8275] dark:text-gray-300 uppercase tracking-wider mb-1.5 block">Тип размерной сетки</label>
            <select
              value={sizeType}
              onChange={(e) => setSizeType(e.target.value)}
              className="w-full px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold text-sm font-medium"
            >
              {SIZE_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {sizeType !== 'one_size' && (
            <div>
              <label className="text-xs font-bold text-[#8A8275] dark:text-gray-300 uppercase tracking-wider mb-1.5 block">
                Размеры ({sizes.length})
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSize() } }}
                  placeholder="Например: 42 или XL"
                  className="flex-1 px-4 py-2.5 border border-[#E8E2D5] dark:border-dark-border rounded-xl bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold text-sm"
                />
                <button
                  onClick={addSize}
                  className="px-4 py-2.5 rounded-xl bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A] font-bold hover:bg-[#142038] dark:hover:bg-[#d6b57e] transition-colors flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  Добавить
                </button>
              </div>
              {sizes.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {sizes.map((size, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border rounded-lg text-xs font-bold text-[#1B2A4A] dark:text-white">
                      {size}
                      <button onClick={() => setSizes(sizes.filter((_, i) => i !== idx))} className="text-[#9B3B3B] dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#8A8275] dark:text-gray-400">Размеры не заданы — товар будет без остатков по размерам</p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-3 rounded-xl bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white font-bold hover:bg-[#E8E2D5] dark:hover:bg-dark-border transition-colors">
            Отмена
          </button>
          <button onClick={submit} className="px-4 py-3 rounded-xl bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A] font-bold hover:bg-[#142038] dark:hover:bg-[#d6b57e] transition-colors">
            {initial ? 'Сохранить' : 'Добавить'}
          </button>
        </div>
      </div>
    </div>
  )
}