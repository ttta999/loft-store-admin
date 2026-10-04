// ✅ Загрузка дерева категорий + журнал изменений + кеш
import { supabase } from './supabase'
import { categoriesCacheApi } from './cache'

export interface CategoryRow {
  id: string
  name_ru: string
  name_uz: string
  icon: string
  sort_order: number
  is_active: boolean
}

export interface SubcategoryRow {
  id: string
  category_id: string
  name_ru: string
  name_uz: string
  size_type: string
  sizes: string[]
  sort_order: number
  is_active: boolean
}

export interface CategoryTree extends CategoryRow {
  subcategories: SubcategoryRow[]
}

// ✅ Дерево категорий с кешем
export const fetchCategoriesTree = async (force = false): Promise<CategoryTree[]> => {
  if (!force) {
    const cached = categoriesCacheApi.get()
    if (cached) return cached as CategoryTree[]
  }

  const [{ data: cats, error: catsErr }, { data: subs, error: subsErr }] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order', { ascending: true }),
    supabase.from('subcategories').select('*').order('sort_order', { ascending: true }),
  ])
  if (catsErr) throw catsErr
  if (subsErr) throw subsErr

  const tree: CategoryTree[] = (cats || []).map((c: any) => ({
    ...c,
    sizes: undefined,
    subcategories: (subs || [])
      .filter((s: any) => s.category_id === c.id)
      .map((s: any) => ({ ...s, sizes: Array.isArray(s.sizes) ? s.sizes : [] })),
  })) as CategoryTree[]

  categoriesCacheApi.set(tree)
  return tree
}

export const invalidateCategoriesCache = () => categoriesCacheApi.invalidate()

// ✅ Журнал изменений: кто и что поменял
export const logCategoryChange = async (
  action: string,
  entityType: 'category' | 'subcategory',
  entityId: string,
  changes?: any
) => {
  try {
    const { data: userData } = await supabase.auth.getUser()
    await supabase.from('category_change_logs').insert({
      action,
      entity_type: entityType,
      entity_id: entityId,
      admin_email: userData?.user?.email || null,
      changes: changes || null,
    })
  } catch (error) {
    // Логирование не должно ломать основной поток
    console.error('Ошибка логирования:', error)
  }
}

// ✅ Транслитерация для авто-генерации slug
const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

export const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .split('')
    .map((ch) => TRANSLIT[ch] ?? (/[a-z0-9]/.test(ch) ? ch : '-'))
    .join('')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')