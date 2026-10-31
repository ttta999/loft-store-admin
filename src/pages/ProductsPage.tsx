import { Lightbulb } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { productsCacheApi, brandsCacheApi, variantsCacheApi, invalidateAllCaches, categoryRowsCacheApi, subcategoriesCacheApi, colorsCacheApi } from '../lib/cache'
import { toast } from 'sonner'
import {
  ArrowLeft, Plus, Edit, Trash2, Search, Package, Upload, X, Eye, EyeOff,
  Copy, Star, Loader2, CheckCircle2, Circle, Info, Tag, DollarSign, Ruler,
  Image as ImageIcon, Save, RefreshCw, ChevronRight, Palette,
} from 'lucide-react'
import { sortSizes, sortSizeStrings } from '../lib/sortSizes'

const CATEGORIES = [
  {
    value: 'shoes',
    label: 'Обувь ',
    subcategories: [
      { value: 'sneakers', label: 'Кроссовки' },
      { value: 'boots', label: 'Ботинки' },
      { value: 'loafers', label: 'Лоферы' },
      { value: 'sandals-shlapantsy', label: 'Сандали и Шлепанцы' },
    ]
  },
  {
    value: 'clothes',
    label: 'Одежда ',
    subcategories: [
      { value: 't-shirts', label: 'Футболки' },
      { value: 'shirts', label: 'Рубашки' },
      { value: 'sweaters-cardigans', label: 'Джемперы и Кардиганы' },
      { value: 'pants', label: 'Брюки' },
      { value: 'jeans', label: 'Джинсы' },
      { value: 'tracksuits', label: 'Спортивные костюмы' },
      { value: 'outerwear', label: 'Верхняя одежда' },
    ]
  },
  {
    value: 'accessories',
    label: 'Аксессуары ',
    subcategories: [
      { value: 'belts', label: 'Ремни' },
      { value: 'caps', label: 'Кепки' },
      { value: 'hats', label: 'Шапки' },
      { value: 'bags-backpacks', label: 'Сумки и Рюкзаки' },
    ]
  },
]

const SUBCATEGORY_SIZE_CONFIG: Record<string, { type: string; range: string[] }> = {
  'sneakers': { type: 'numeric', range: ['38', '39', '40', '41', '42', '43', '44', '45', '46', '47'] },
  'boots': { type: 'numeric', range: ['38', '39', '40', '41', '42', '43', '44', '45', '46', '47'] },
  'loafers': { type: 'numeric', range: ['38', '39', '40', '41', '42', '43', '44', '45', '46', '47'] },
  'sandals-shlapantsy': { type: 'numeric', range: ['38', '39', '40', '41', '42', '43', '44', '45', '46', '47'] },
  't-shirts': { type: 'alphabetical', range: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  'shirts': { type: 'alphabetical', range: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  'sweaters-cardigans': { type: 'alphabetical', range: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  'pants': { type: 'combined', range: ['44', '46', '48', '50', '52', '54', '56', 'XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  'jeans': { type: 'combined', range: ['44', '46', '48', '50', '52', '54', '56', 'XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  'tracksuits': { type: 'alphabetical', range: ['S', 'M', 'L', 'XL', 'XXL'] },
  'outerwear': { type: 'alphabetical', range: ['S', 'M', 'L', 'XL', 'XXL'] },
  'belts': { type: 'combined', range: ['S', 'M', 'L', 'XL', '80', '85', '90', '95', '100', '105', '110', '115', '120', '125', '130'] },
  'caps': { type: 'one_size', range: [] },
  'hats': { type: 'one_size', range: [] },
  'bags-backpacks': { type: 'one_size', range: [] },
}

const MAX_IMAGES = 8

interface Product {
  id: string
  name_ru: string
  name_uz: string
  description_ru: string
  description_uz: string
  category: string
  subcategory: string
  brand?: string
  price_usd: number
  sale_price?: number | null
  images: string[]
  size_type: string
  is_active: boolean
  created_at: string
}

interface ProductVariant {
  id: string
  product_id: string
  size_value: string
  stock: number
  color_id?: string | null
}

interface Brand {
  id: string
  name: string
}

// ✅ Категории и подкатегории из БД
interface Category {
  id: string
  name_ru: string
  name_uz: string
  icon: string | null
  sort_order: number
  is_active: boolean
}

interface Subcategory {
  id: string
  category_id: string
  name_ru: string
  name_uz: string
  size_type: string
  sizes: string[]
  sort_order: number
  is_active: boolean
}

// ✅ Цвет товара (таблица product_colors)
interface ProductColorRow {
  id: string
  product_id: string
  name_ru: string
  name_uz: string | null
  hex_code: string | null
  images: string[]
  sort_order: number
  _isNew?: boolean
}

// ✅ Защита от «битого» кеша
const isFullProductRows = (list: any[]): boolean =>
  !list || list.length === 0 || (list[0] != null && typeof list[0].name_ru === 'string')

// ✅ Секция модалки в стиле карточки приложения
function ModalSection({ icon, title, subtitle, right, children }: {
  icon: React.ReactNode
  title: string
  subtitle?: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border overflow-hidden">
      <div className="flex items-center justify-between gap-3 p-4 border-b border-[#E8E2D5] dark:border-dark-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center text-[#1B2A4A] dark:text-white flex-shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-[#1B2A4A] dark:text-white leading-tight">{title}</h3>
            {subtitle && <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5 truncate">{subtitle}</p>}
          </div>
        </div>
        {right && <div className="flex-shrink-0">{right}</div>}
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}

// ✅ Лейбл поля формы
function FieldLabel({ text, flag, required, hint }: { text: string; flag?: string; required?: boolean; hint?: string }) {
  return (
    <label className="flex items-center gap-1.5 text-xs font-bold text-[#8A8275] dark:text-gray-300 uppercase tracking-wider mb-1.5">
      <span>{text}</span>
      {flag && <span className="text-sm leading-none">{flag}</span>}
      {required && <span className="text-[#9B3B3B] dark:text-red-400">*</span>}
      {hint && <span className="text-[10px] font-normal text-[#8A8275] dark:text-gray-400 normal-case tracking-normal">— {hint}</span>}
    </label>
  )
}

export default function ProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [dbCategories, setDbCategories] = useState<Category[]>([])
  const [dbSubcategories, setDbSubcategories] = useState<Subcategory[]>([])
  // ✅ Все цвета всех товаров (для списка и модалки)
  const [colors, setColors] = useState<ProductColorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'active' | 'hidden' | 'sale'>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [nameRu, setNameRu] = useState('')
  const [nameUz, setNameUz] = useState('')
  const [descriptionRu, setDescriptionRu] = useState('')
  const [descriptionUz, setDescriptionUz] = useState('')
  const [category, setCategory] = useState('shoes')
  const [subcategory, setSubcategory] = useState('')
  const [brand, setBrand] = useState('')
  const [priceUsd, setPriceUsd] = useState('')
  const [salePriceUsd, setSalePriceUsd] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [sizeType, setSizeType] = useState('numeric')
  const [uploading, setUploading] = useState(false)
  // ✅ Остатки: без цвета (flat) и по цветам (colorId → size → stock)
  const [selectedSizes, setSelectedSizes] = useState<Record<string, number>>({})
  const [sizesByColor, setSizesByColor] = useState<Record<string, Record<string, number>>>({})
  const [productColors, setProductColors] = useState<ProductColorRow[]>([])
  const [activeColorId, setActiveColorId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const activeCategoryIds = useMemo(
    () => new Set(dbCategories.filter(c => c.is_active).map(c => c.id)),
    [dbCategories]
  )
  const activeSubcategoryIds = useMemo(
    () => new Set(dbSubcategories.filter(s => s.is_active).map(s => s.id)),
    [dbSubcategories]
  )

  const categoryById = useMemo(() => {
    const map: Record<string, Category> = {}
    dbCategories.forEach(c => { map[c.id] = c })
    return map
  }, [dbCategories])

  const subcategoryById = useMemo(() => {
    const map: Record<string, Subcategory> = {}
    dbSubcategories.forEach(s => { map[s.id] = s })
    return map
  }, [dbSubcategories])

  const subcategoriesByCategory = useMemo(() => {
    const map: Record<string, Subcategory[]> = {}
    dbSubcategories
      .slice()
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .forEach(s => {
        if (!map[s.category_id]) map[s.category_id] = []
        map[s.category_id].push(s)
      })
    return map
  }, [dbSubcategories])

  // ✅ Цвета, сгруппированные по товарам (для списка)
  const colorsByProduct = useMemo(() => {
    const map: Record<string, ProductColorRow[]> = {}
    colors.forEach(c => {
      if (!map[c.product_id]) map[c.product_id] = []
      map[c.product_id].push(c)
    })
    return map
  }, [colors])

  useEffect(() => {
    loadAll(false)
  }, [])

  const loadAll = async (forceRefresh = false) => {
    if (forceRefresh) invalidateAllCaches()
    const cachedProducts = !forceRefresh ? productsCacheApi.get() : null
    const cachedVariants = !forceRefresh ? variantsCacheApi.get() : null
    const cachedBrands = !forceRefresh ? brandsCacheApi.get() : null

    const productsValid = cachedProducts && isFullProductRows(cachedProducts as any[])
    const variantsValid = !!cachedVariants
    const brandsValid = cachedBrands && (cachedBrands.length === 0 || typeof cachedBrands[0]?.name === 'string')

    if (productsValid && variantsValid && brandsValid) {
      setProducts(cachedProducts as Product[])
      setVariants(cachedVariants as ProductVariant[])
      setBrands(cachedBrands as Brand[])
      setLoading(false)
    }

    if (cachedProducts && !isFullProductRows(cachedProducts as any[])) productsCacheApi.invalidate()
    if (cachedBrands && !brandsValid) brandsCacheApi.invalidate()

    if (!productsValid && !variantsValid && !brandsValid) {
      if (forceRefresh) setRefreshing(true)
      else setLoading(true)
    }

    try {
      // ✅ ПАРАЛЛЕЛЬНАЯ загрузка 6 таблиц (добавилась product_colors)
      const [productsRes, variantsRes, brandsRes, categoriesRes, subcategoriesRes, colorsRes] = await Promise.all([
        productsValid
          ? Promise.resolve({ data: cachedProducts, error: null })
          : supabase.from('products').select('*').order('created_at', { ascending: false }),
        variantsValid
          ? Promise.resolve({ data: cachedVariants, error: null })
          : supabase.from('product_variants').select('*'),
        brandsValid
          ? Promise.resolve({ data: cachedBrands, error: null })
          : supabase.from('brands').select('*').order('name'),
        !forceRefresh && categoryRowsCacheApi.get() ? Promise.resolve({ data: categoryRowsCacheApi.get(), error: null }) : supabase.from('categories').select('*').order('sort_order', { ascending: true }),
        !forceRefresh && subcategoriesCacheApi.get() ? Promise.resolve({ data: subcategoriesCacheApi.get(), error: null }) : supabase.from('subcategories').select('*').order('sort_order', { ascending: true }),
        !forceRefresh && colorsCacheApi.get() ? Promise.resolve({ data: colorsCacheApi.get(), error: null }) : supabase.from('product_colors').select('*').order('sort_order', { ascending: true }),
      ])

      const failed = [productsRes, variantsRes, brandsRes, categoriesRes, subcategoriesRes, colorsRes].find(result => result.error)
      if (failed?.error) throw failed.error

      const productsList = (productsRes.data || []) as Product[]
      const variantsList = (variantsRes.data || []) as ProductVariant[]
      const brandsList = (brandsRes.data || []) as Brand[]
      const categoriesList = (categoriesRes.data || []) as Category[]
      const subcategoriesList = (subcategoriesRes.data || []) as Subcategory[]
      const colorsList = (colorsRes.data || []) as ProductColorRow[]

      setProducts(productsList)
      setVariants(variantsList)
      setBrands(brandsList)
      setDbCategories(categoriesList)
      setDbSubcategories(subcategoriesList)
      setColors(colorsList)

      productsCacheApi.set(productsList)
      variantsCacheApi.set(variantsList)
      brandsCacheApi.set(brandsList)
      categoryRowsCacheApi.set(categoriesList)
      subcategoriesCacheApi.set(subcategoriesList)
      colorsCacheApi.set(colorsList)
    } catch (error) {
      console.error('Ошибка загрузки:', error)
      if (!productsValid && !variantsValid && !brandsValid) {
        toast.error('Ошибка при загрузке товаров')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    productsCacheApi.invalidate()
    brandsCacheApi.invalidate()
    variantsCacheApi.invalidate()
    loadAll(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const remaining = MAX_IMAGES - images.length
    if (remaining <= 0) {
      toast.error(`Максимум ${MAX_IMAGES} фото`)
      return
    }
    const filesToUpload = Array.from(files).slice(0, remaining)
    if (files.length > remaining) {
      toast.info(`Загрузим первые ${remaining} фото — лимит ${MAX_IMAGES}`)
    }

    setUploading(true)
    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file)
        if (uploadError) {
          console.error('Ошибка загрузки:', uploadError)
          toast.error('Ошибка загрузки фото')
          continue
        }
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)
        if (urlData?.publicUrl) {
          setImages(prev => [...prev, urlData.publicUrl])
        }
      }
    } catch (error) {
      console.error('Ошибка:', error)
      toast.error('Ошибка при загрузке')
    }
    setUploading(false)
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const makeCover = (index: number) => {
    setImages(prev => [prev[index], ...prev.filter((_, i) => i !== index)])
  }

  // ========== ЦВЕТА: хелперы ==========
  const addColor = () => {
    const tid = `temp-${Date.now()}-${productColors.length}`
    setProductColors(prev => [...prev, {
      id: tid,
      product_id: editingProduct?.id || '',
      name_ru: '',
      name_uz: '',
      hex_code: '#1B2A4A',
      images: [],
      sort_order: prev.length,
      _isNew: true,
    }])
    // ✅ При добавлении ПЕРВОГО цвета переносим в него текущие остатки
    if (productColors.length === 0 && Object.keys(selectedSizes).length > 0) {
      setSizesByColor(prev => ({ ...prev, [tid]: { ...selectedSizes } }))
      setSelectedSizes({})
    }
    if (!activeColorId) setActiveColorId(tid)
  }

  const removeColor = (idx: number) => {
    const removed = productColors[idx]
    setProductColors(prev => prev.filter((_, i) => i !== idx))
    setSizesByColor(prev => {
      const next = { ...prev }
      delete next[removed.id]
      return next
    })
    if (activeColorId === removed.id) {
      const remaining = productColors.filter((_, i) => i !== idx)
      setActiveColorId(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  const updateColor = (idx: number, field: keyof ProductColorRow, value: any) => {
    setProductColors(prev => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)))
  }

  const handleColorImagesUpload = async (colorIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const uploadedUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `color-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file)
        if (uploadError) {
          console.error('Ошибка загрузки:', uploadError)
          toast.error('Ошибка загрузки фото')
          continue
        }
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)
        if (urlData?.publicUrl) uploadedUrls.push(urlData.publicUrl)
      }
      setProductColors(prev => prev.map((c, i) =>
        i === colorIdx ? { ...c, images: [...(c.images || []), ...uploadedUrls] } : c
      ))
    } catch (error) {
      console.error('Ошибка:', error)
      toast.error('Ошибка при загрузке')
    }
    setUploading(false)
    e.target.value = ''
  }

  const removeColorImage = (colorIdx: number, imgIdx: number) => {
    setProductColors(prev => prev.map((c, i) => {
      if (i !== colorIdx) return c
      return { ...c, images: (c.images || []).filter((_, j) => j !== imgIdx) }
    }))
  }

  // ✅ Текущая карта размеров: для активного цвета или плоская (без цветов)
  const currentSizesMap = (): Record<string, number> => {
    if (productColors.length > 0 && activeColorId) {
      return sizesByColor[activeColorId] || {}
    }
    return selectedSizes
  }

  const setSizeMap = (updater: (m: Record<string, number>) => Record<string, number>) => {
    if (productColors.length > 0 && activeColorId) {
      setSizesByColor(prev => ({ ...prev, [activeColorId]: updater(prev[activeColorId] || {}) }))
    } else {
      setSelectedSizes(prev => updater(prev))
    }
  }

  const toggleSize = (size: string) => {
    setSizeMap(m => {
      const next = { ...m }
      if (next[size] !== undefined) delete next[size]
      else next[size] = 0
      return next
    })
  }

  const updateStock = (size: string, stock: number) => {
    setSizeMap(m => ({ ...m, [size]: Math.max(0, stock) }))
  }

  // ✅ Общий остаток по всем цветам (или плоский)
  const totalStock = useMemo(() => {
    let sum = 0
    if (productColors.length > 0) {
      Object.values(sizesByColor).forEach(m => {
        Object.values(m).forEach(s => { sum += s })
      })
    } else {
      Object.values(selectedSizes).forEach(s => { sum += s })
    }
    return sum
  }, [sizesByColor, selectedSizes, productColors])

  const resetForm = () => {
    setEditingProduct(null)
    setNameRu('')
    setNameUz('')
    setDescriptionRu('')
    setDescriptionUz('')
    setCategory('shoes')
    setSubcategory('')
    setBrand('')
    setPriceUsd('')
    setSalePriceUsd('')
    setImages([])
    setSizeType('numeric')
    setSelectedSizes({})
    setSizesByColor({})
    setProductColors([])
    setActiveColorId(null)
    setErrors({})
  }

  const openAddModal = () => {
    resetForm()
    const firstActiveCat = dbCategories.find(c => c.is_active)
    if (firstActiveCat) setCategory(firstActiveCat.id)
    setShowModal(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setNameRu(product.name_ru)
    setNameUz(product.name_uz)
    setDescriptionRu(product.description_ru || '')
    setDescriptionUz(product.description_uz || '')
    setCategory(product.category)
    setSubcategory(product.subcategory || '')
    setBrand(product.brand || '')
    setPriceUsd(product.price_usd.toString())
    setSalePriceUsd(product.sale_price ? String(product.sale_price) : '')
    setImages(product.images || [])
    setSizeType(product.size_type || 'numeric')

    // ✅ Разбираем варианты на «без цвета» и «по цветам»
    const productVariants = variants.filter(v => v.product_id === product.id)
    const flat: Record<string, number> = {}
    const byColor: Record<string, Record<string, number>> = {}
    productVariants.forEach(v => {
      if (v.color_id) {
        if (!byColor[v.color_id]) byColor[v.color_id] = {}
        byColor[v.color_id][v.size_value] = v.stock
      } else {
        flat[v.size_value] = v.stock
      }
    })
    setSelectedSizes(flat)
    setSizesByColor(byColor)

    const pColors = colors
      .filter(c => c.product_id === product.id)
      .map(c => ({ ...c, _isNew: false }))
    setProductColors(pColors)
    setActiveColorId(pColors.length > 0 ? pColors[0].id : null)
    setErrors({})
    setShowModal(true)
  }

  const openDuplicateModal = (product: Product) => {
    setEditingProduct(null)
    setNameRu(`${product.name_ru} (копия)`)
    setNameUz(product.name_uz ? `${product.name_uz} (nusxa)` : '')
    setDescriptionRu(product.description_ru || '')
    setDescriptionUz(product.description_uz || '')
    setCategory(product.category)
    setSubcategory(product.subcategory || '')
    setBrand(product.brand || '')
    setPriceUsd(product.price_usd.toString())
    setSalePriceUsd(product.sale_price ? String(product.sale_price) : '')
    setImages(product.images || [])
    setSizeType(product.size_type || 'numeric')

    // ✅ Цвети дублируются как новые (temp id), остатки переносятся
    const productVariants = variants.filter(v => v.product_id === product.id)
    const flat: Record<string, number> = {}
    productVariants.forEach(v => {
      if (!v.color_id) flat[v.size_value] = v.stock
    })

    const origColors = colors.filter(c => c.product_id === product.id)
    const remap: Record<string, string> = {}
    const dupColors = origColors.map((c, i) => {
      const tid = `temp-${Date.now()}-${i}`
      remap[c.id] = tid
      return { ...c, id: tid, _isNew: true }
    })
    const byColor: Record<string, Record<string, number>> = {}
    productVariants.forEach(v => {
      if (v.color_id && remap[v.color_id]) {
        const tid = remap[v.color_id]
        if (!byColor[tid]) byColor[tid] = {}
        byColor[tid][v.size_value] = v.stock
      }
    })

    setSelectedSizes(flat)
    setSizesByColor(byColor)
    setProductColors(dupColors)
    setActiveColorId(dupColors.length > 0 ? dupColors[0].id : null)
    setErrors({})
    setShowModal(true)
  }

  const clearError = (key: string) => {
    setErrors(prev => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const handleSave = async () => {
    const newErrors: Record<string, string> = {}
    if (!nameRu.trim()) newErrors.nameRu = 'Укажите название (RU)'
    if (!priceUsd || parseFloat(priceUsd) <= 0) newErrors.priceUsd = 'Укажите цену больше 0'
    if (!subcategory) newErrors.subcategory = 'Выберите подкатегорию'
    if (salePriceUsd && parseFloat(salePriceUsd) > 0) {
      const base = parseFloat(priceUsd) || 0
      const sale = parseFloat(salePriceUsd)
      if (sale >= base) newErrors.salePriceUsd = 'Скидочная цена должна быть ниже основной'
    }
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      toast.error('Заполните обязательные поля')
      return
    }

    const productData: any = {
      name_ru: nameRu,
      name_uz: nameUz || nameRu,
      description_ru: descriptionRu || null,
      description_uz: descriptionUz || null,
      category,
      subcategory,
      price_usd: parseFloat(priceUsd),
      sale_price: salePriceUsd && parseFloat(salePriceUsd) > 0 ? parseFloat(salePriceUsd) : null,
      images,
      size_type: sizeType,
    }
    if (brand) {
      productData.brand = brand
    }
    if (!editingProduct) {
      productData.is_active = true
    }

    setSaving(true)
    try {
      // 1. Сохраняем товар
      let targetProductId: string
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
          .select()
        if (error) {
          console.error('Ошибка Supabase:', error)
          toast.error(`Ошибка при обновлении: ${error.message}`)
          return
        }
        targetProductId = editingProduct.id
      } else {
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single()
        if (error) {
          console.error('Ошибка Supabase:', error)
          toast.error(`Ошибка при создании: ${error.message}`)
          return
        }
        targetProductId = newProduct.id
      }

      // 2. ✅ Цвета: удаляем старые, вставляем новые, запоминаем oldKey → newId
      const validColors = productColors.filter(c => c.name_ru && c.name_ru.trim())
      const colorKeyToNewId: Record<string, string> = {}
      await supabase.from('product_colors').delete().eq('product_id', targetProductId)
      for (let i = 0; i < validColors.length; i++) {
        const c = validColors[i]
        const { data: inserted, error: cErr } = await supabase
          .from('product_colors')
          .insert({
            product_id: targetProductId,
            name_ru: c.name_ru.trim(),
            name_uz: c.name_uz?.trim() || null,
            hex_code: c.hex_code || null,
            images: c.images || [],
            sort_order: i,
          })
          .select()
          .single()
        if (cErr || !inserted) {
          console.error('Ошибка сохранения цвета:', cErr)
          toast.error(`Ошибка сохранения цвета: ${cErr?.message || 'неизвестная'}`)
          return
        }
        colorKeyToNewId[c.id] = inserted.id
      }

      // 3. ✅ Варианты: удаляем старые, вставляем новые (с color_id)
      await supabase.from('product_variants').delete().eq('product_id', targetProductId)
      const newVariants: any[] = []
      if (validColors.length > 0) {
        for (const c of validColors) {
          const newColorId = colorKeyToNewId[c.id]
          const map = sizesByColor[c.id] || {}
          Object.entries(map)
            .filter(([_, stock]) => stock > 0)
            .forEach(([size_value, stock]) => {
              newVariants.push({ product_id: targetProductId, size_value, stock, color_id: newColorId })
            })
        }
      } else {
        Object.entries(selectedSizes)
          .filter(([_, stock]) => stock > 0)
          .forEach(([size_value, stock]) => {
            newVariants.push({ product_id: targetProductId, size_value, stock, color_id: null })
          })
      }
      if (newVariants.length > 0) {
        const { error: variantsError } = await supabase
          .from('product_variants')
          .insert(newVariants)
        if (variantsError) {
          console.error('Ошибка вариантов:', variantsError)
          toast.error(`Ошибка при сохранении размеров: ${variantsError.message}`)
          return
        }
      }

      toast.success(editingProduct ? 'Товар обновлён! ' : 'Товар добавлен! ')
      setShowModal(false)
      productsCacheApi.invalidate()
      variantsCacheApi.invalidate()
      await loadAll(true)
    } catch (error: any) {
      console.error('Полная ошибка:', error)
      toast.error('Ошибка при сохранении: ' + (error?.message || error || 'Неизвестная ошибка'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Удалить этот товар? Это действие нельзя отменить.')) return
    try {
      await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', productId)
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
      if (error) throw error
      toast.success('Товар удалён! ')
      productsCacheApi.invalidate()
      await loadAll(true)
    } catch (error) {
      console.error('Ошибка:', error)
      toast.error('Ошибка при удалении')
    }
  }

  const toggleActive = async (productId: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentActive })
        .eq('id', productId)
      if (error) throw error
      toast.success(currentActive
        ? 'Товар скрыт из приложения '
        : 'Товар снова виден ')
      productsCacheApi.invalidate()
      await loadAll(true)
    } catch (error: any) {
      console.error('Ошибка:', error)
      toast.error('Ошибка: ' + (error?.message || 'Неизвестная ошибка'))
    }
  }

  const handleSubcategoryChange = (newSubcategory: string) => {
    setSubcategory(newSubcategory)
    clearError('subcategory')
    const config = SUBCATEGORY_SIZE_CONFIG[newSubcategory]
    if (config) {
      setSizeType(config.type)
      setSelectedSizes({})
      setSizesByColor({})
    }
  }

  const getAvailableSizes = () => {
    const config = SUBCATEGORY_SIZE_CONFIG[subcategory]
    let raw: string[] = []
    if (config && config.range.length > 0) {
      raw = config.range
    } else if (sizeType === 'numeric') {
      raw = ['38', '39', '40', '41', '42', '43', '44', '45', '46', '47']
    } else if (sizeType === 'alphabetical') {
      raw = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    }
    return sortSizeStrings(raw)
  }

  const getFormSubcategories = () => {
    const subs = subcategoriesByCategory[category] || []
    if (editingProduct) return subs
    return subs.filter(s => s.is_active)
  }

  const getFormCategories = () => {
    if (dbCategories.length === 0) return CATEGORIES.map(c => ({ id: c.value, name_ru: c.label.replace(/ \S+$/, ''), is_active: true }))
    if (editingProduct) return dbCategories
    return dbCategories.filter(c => c.is_active)
  }

  const getHardcodedSubcategories = () => {
    const cat = CATEGORIES.find(c => c.value === category)
    return cat?.subcategories || []
  }

  const hasSale = (p: Product) => p.sale_price != null && Number(p.sale_price) > 0

  const isProductVisibleInApp = (p: Product): boolean => {
    if (p.is_active === false) return false
    if (!activeCategoryIds.has(p.category)) return false
    if (p.subcategory && !activeSubcategoryIds.has(p.subcategory)) return false
    return true
  }

  const filteredProducts = products.filter(p => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      (p.name_ru || '').toLowerCase().includes(q) ||
      (p.name_uz || '').toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q)
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter
    const matchesVisibility = visibilityFilter === 'all' ||
      (visibilityFilter === 'active' && p.is_active !== false) ||
      (visibilityFilter === 'hidden' && p.is_active === false) ||
      (visibilityFilter === 'sale' && hasSale(p))
    return matchesSearch && matchesCategory && matchesVisibility
  })

  const activeCount = products.filter(p => p.is_active !== false).length
  const hiddenCount = products.filter(p => p.is_active === false).length
  const saleCount = products.filter(p => hasSale(p)).length

  const baseNum = parseFloat(priceUsd) > 0 ? parseFloat(priceUsd) : null
  const saleNum = parseFloat(salePriceUsd) > 0 ? parseFloat(salePriceUsd) : null
  const discountPercent =
    baseNum && saleNum && saleNum < baseNum
      ? Math.round((1 - saleNum / baseNum) * 100)
      : null

  const getCategoryLabel = (catId: string): string => {
    const dbCat = categoryById[catId]
    if (dbCat) return dbCat.name_ru
    const hb = CATEGORIES.find(c => c.value === catId)
    return hb?.label || catId
  }

  const getSubcategoryLabel = (catId: string, subId: string): string => {
    const dbSub = subcategoryById[subId]
    if (dbSub) return dbSub.name_ru
    const hbCat = CATEGORIES.find(c => c.value === catId)
    const hbSub = hbCat?.subcategories.find(s => s.value === subId)
    return hbSub?.label || subId
  }

  const isCategoryDisabled = (catId: string): boolean => {
    const dbCat = categoryById[catId]
    return !!dbCat && !dbCat.is_active
  }

  const isSubcategoryDisabled = (subId: string): boolean => {
    const dbSub = subcategoryById[subId]
    return !!dbSub && !dbSub.is_active
  }

  const getProductHiddenReason = (p: Product): string | null => {
    if (p.is_active === false) return 'Товар скрыт вручную'
    if (!activeCategoryIds.has(p.category)) return 'Категория отключена'
    if (p.subcategory && !activeSubcategoryIds.has(p.subcategory)) return 'Подкатегория отключена'
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg flex items-center justify-center">
        <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B2A4A] dark:border-gold mx-auto mb-4"></div>
          <p className="text-[#1B2A4A] dark:text-white font-medium">Загрузка товаров...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg">

      {/* ✅ Sticky-шапка */}
      <div className="sticky top-0 z-20 bg-[#F5F1E8]/95 dark:bg-dark-bg/95 backdrop-blur-sm border-b border-[#E8E2D5] dark:border-dark-border px-6 py-4">
        <div className="max-w-7xl mx-auto">
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
              <h1 className="text-2xl font-bold text-[#1B2A4A] dark:text-white">Товары</h1>
              <span className="w-10 h-10 rounded-full bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center">
                <Package size={18} className="text-[#1B2A4A] dark:text-white" />
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
                onClick={openAddModal}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A] hover:bg-[#142038] dark:hover:bg-[#d6b57e] transition-colors"
              >
                <Plus size={16} />
                Добавить товар
              </button>
            </div>
          </div>

          {/* ✅ Поиск */}
          <div className="mt-4 bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border overflow-hidden">
            <div className="flex items-center gap-3 p-3">
              <div className="w-9 h-9 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
                <Search size={16} className="text-[#1B2A4A] dark:text-white" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по названию или бренду..."
                className="flex-1 bg-transparent text-sm font-medium text-[#1B2A4A] dark:text-white focus:outline-none placeholder:text-[#8A8275] dark:placeholder:text-gray-500"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="p-1.5 rounded-lg text-[#8A8275] dark:text-gray-300 hover:bg-[#F5F1E8] dark:hover:bg-dark-accent transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* ✅ Фильтры по категориям */}
          <div className="mt-3 flex gap-2 flex-wrap">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A]'
                  : 'bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white hover:bg-[#F5F1E8] dark:hover:bg-dark-accent'
              }`}
            >
              Все <span className="opacity-70">({products.length})</span>
            </button>
            {(dbCategories.length > 0 ? dbCategories : CATEGORIES.map(c => ({ id: c.value, name_ru: c.label.replace(/ \S+$/, ''), is_active: true } as Category))).map(cat => {
              const count = products.filter(p => p.category === cat.id).length
              const disabled = !cat.is_active
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                    categoryFilter === cat.id
                      ? 'bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A]'
                      : 'bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white hover:bg-[#F5F1E8] dark:hover:bg-dark-accent'
                  } ${disabled ? 'opacity-70' : ''}`}
                >
                  {cat.name_ru}
                  {disabled && <span className="ml-1 text-[10px] text-[#C9A961] dark:text-gold">(скрыто)</span>}
                  <span className="opacity-70"> ({count})</span>
                </button>
              )
            })}
          </div>

          {/* ✅ Фильтры по видимости */}
          <div className="mt-3 flex gap-2 flex-wrap">
            <button
              onClick={() => setVisibilityFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                visibilityFilter === 'all'
                  ? 'bg-[#C9A961] text-white'
                  : 'bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white hover:bg-[#F5F1E8] dark:hover:bg-dark-accent'
              }`}
            >
              Все ({products.length})
            </button>
            <button
              onClick={() => setVisibilityFilter('active')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                visibilityFilter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white hover:bg-[#F5F1E8] dark:hover:bg-dark-accent'
              }`}
            >
              <Eye size={14} />
              Видимые ({activeCount})
            </button>
            <button
              onClick={() => setVisibilityFilter('hidden')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                visibilityFilter === 'hidden'
                  ? 'bg-[#C9A961] text-white'
                  : 'bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white hover:bg-[#F5F1E8] dark:hover:bg-dark-accent'
              }`}
            >
              <EyeOff size={14} />
              Скрытые ({hiddenCount})
            </button>
            <button
              onClick={() => setVisibilityFilter('sale')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                visibilityFilter === 'sale'
                  ? 'bg-[#9B3B3B] dark:bg-red-600 text-white'
                  : 'bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white hover:bg-[#F5F1E8] dark:hover:bg-dark-accent'
              }`}
            >
               Скидки ({saleCount})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {filteredProducts.length === 0 ? (
          <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border mx-auto mb-4 flex items-center justify-center">
              <Package size={28} className="text-[#8A8275] dark:text-gray-300" />
            </div>
            <p className="text-base font-medium text-[#1B2A4A] dark:text-white mb-1">
              Товары не найдены
            </p>
            <p className="text-sm text-[#8A8275] dark:text-gray-300">
              Попробуйте изменить фильтры или добавьте новый товар
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => {
              const productVariants = sortSizes(
                variants.filter(v => v.product_id === product.id),
                v => v.size_value
              )
              const totalStockList = productVariants.reduce((sum, v) => sum + v.stock, 0)
              const isActive = product.is_active !== false
              const sale = hasSale(product)
              const visibleInApp = isProductVisibleInApp(product)
              const hiddenReason = getProductHiddenReason(product)
              const productColorsList = colorsByProduct[product.id] || []
              const colorNameById: Record<string, string> = {}
              productColorsList.forEach(c => { colorNameById[c.id] = c.name_ru })

              return (
                <div
                  key={product.id}
                  className={`bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border overflow-hidden transition-shadow hover:shadow-md ${
                    !isActive
                      ? 'border-[#C9A961] dark:border-gold opacity-70'
                      : !visibleInApp
                        ? 'border-[#C9A961]/60 dark:border-gold/60'
                        : 'border-[#E8E2D5] dark:border-dark-border'
                  }`}
                >
                  {/* Шапка карточки */}
                  <div className="flex gap-4 p-4">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name_ru}
                        className="w-24 h-24 object-cover rounded-xl border border-[#E8E2D5] dark:border-dark-border flex-shrink-0"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-xl border border-[#E8E2D5] dark:border-dark-border bg-[#F5F1E8] dark:bg-dark-accent flex items-center justify-center flex-shrink-0">
                        <Package size={28} className="text-[#8A8275] dark:text-gray-300" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-base text-[#1B2A4A] dark:text-white truncate">
                          {product.name_ru}
                        </h3>
                        {!isActive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C9A961]/20 dark:bg-gold/30 text-[#C9A961] dark:text-gold whitespace-nowrap">
                             Скрыт
                          </span>
                        )}
                        {isActive && !visibleInApp && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C9A961]/20 dark:bg-gold/30 text-[#C9A961] dark:text-gold whitespace-nowrap"
                            title={hiddenReason || ''}
                          >
                             Скрыт из приложения{hiddenReason ? ` (${hiddenReason.toLowerCase()})` : ''}
                          </span>
                        )}
                        {sale && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#9B3B3B]/10 dark:bg-red-500/20 text-[#9B3B3B] dark:text-red-400 whitespace-nowrap">
                             Скидка
                          </span>
                        )}
                        {/* ✅ Плашка цветов */}
                        {productColorsList.length > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1B2A4A]/10 dark:bg-gold/20 text-[#1B2A4A] dark:text-gold whitespace-nowrap">
                             {productColorsList.length} цвет.
                          </span>
                        )}
                      </div>
                      {product.name_uz && product.name_uz !== product.name_ru && (
                        <p className="text-xs text-[#8A8275] dark:text-gray-300 truncate">
                          {product.name_uz}
                        </p>
                      )}

                      <div className="flex items-center gap-2 flex-wrap text-xs text-[#8A8275] dark:text-gray-300 mt-2">
                        <span className={`px-2 py-0.5 rounded-full border ${
                          isCategoryDisabled(product.category)
                            ? 'bg-[#C9A961]/10 dark:bg-gold/20 text-[#C9A961] dark:text-gold border-[#C9A961]/30 dark:border-gold/40'
                            : 'bg-[#F5F1E8] dark:bg-dark-accent border-[#E8E2D5] dark:border-dark-border'
                        }`}>
                          {getCategoryLabel(product.category)}
                          {isCategoryDisabled(product.category) && ' (скрыто)'}
                        </span>
                        {product.subcategory && (
                          <>
                            <ChevronRight size={10} />
                            <span className={`px-2 py-0.5 rounded-full border ${
                              isSubcategoryDisabled(product.subcategory)
                                ? 'bg-[#C9A961]/10 dark:bg-gold/20 text-[#C9A961] dark:text-gold border-[#C9A961]/30 dark:border-gold/40'
                                : 'bg-[#F5F1E8] dark:bg-dark-accent border-[#E8E2D5] dark:border-dark-border'
                            }`}>
                              {getSubcategoryLabel(product.category, product.subcategory)}
                              {isSubcategoryDisabled(product.subcategory) && ' (скрыто)'}
                            </span>
                          </>
                        )}
                        {product.brand && (
                          <span className="px-2 py-0.5 rounded-full bg-[#C9A961]/10 dark:bg-gold/20 text-[#C9A961] dark:text-gold font-medium">
                            {product.brand}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border">
                          Остаток: <b className="text-[#1B2A4A] dark:text-white">{totalStockList}</b> шт.
                        </span>
                      </div>

                      {/* ✅ Размеры (с цветом, если есть) */}
                      {productVariants.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mt-2">
                          {productVariants.slice(0, 8).map(v => (
                            <span
                              key={v.id}
                              className="px-2 py-0.5 bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border rounded text-[10px] font-bold text-[#1B2A4A] dark:text-white"
                            >
                              {v.color_id && colorNameById[v.color_id] ? `${colorNameById[v.color_id]} · ` : ''}{v.size_value}: {v.stock}
                            </span>
                          ))}
                          {productVariants.length > 8 && (
                            <span className="px-2 py-0.5 text-[10px] text-[#8A8275] dark:text-gray-300">
                              +{productVariants.length - 8}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      {sale ? (
                        <>
                          <p className="text-xs text-[#8A8275] dark:text-gray-400 line-through">${product.price_usd}</p>
                          <p className="text-xl font-bold text-[#9B3B3B] dark:text-red-400">${product.sale_price}</p>
                        </>
                      ) : (
                        <p className="text-xl font-bold text-[#1B2A4A] dark:text-white">${product.price_usd}</p>
                      )}
                    </div>
                  </div>

                  {/* Футер с кнопками действий */}
                  <div className="flex items-center gap-2 p-3 pt-2 border-t border-[#E8E2D5] dark:border-dark-border bg-[#F5F1E8]/40 dark:bg-dark-accent/30 flex-wrap">
                    <button
                      onClick={() => openEditModal(product)}
                      className="px-4 py-2 bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A] rounded-xl text-xs font-bold hover:bg-[#142038] dark:hover:bg-[#d6b57e] transition-colors flex items-center gap-1.5"
                    >
                      <Edit size={14} />
                      Редактировать
                    </button>
                    <button
                      onClick={() => toggleActive(product.id, isActive)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#C9A961]/10 dark:bg-gold/20 text-[#C9A961] dark:text-gold hover:bg-[#C9A961]/20 dark:hover:bg-gold/30 border border-[#C9A961]/30 dark:border-gold/40'
                          : 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20 border border-green-200 dark:border-green-500/30'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <EyeOff size={14} />
                          Скрыть
                        </>
                      ) : (
                        <>
                          <Eye size={14} />
                          Показать
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-4 py-2 bg-red-50 dark:bg-red-500/10 text-[#9B3B3B] dark:text-red-400 rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center gap-1.5 border border-red-200 dark:border-red-500/30"
                    >
                      <Trash2 size={14} />
                      Удалить
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ✅ МОДАЛКА ТОВАРА */}
      {showModal && (
        <div
          className="loft-modal fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !saving && setShowModal(false)}
        >
          <div
            className="bg-[#F5F1E8] dark:bg-dark-bg rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl border border-[#E8E2D5] dark:border-dark-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ✅ Шапка модалки */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#E8E2D5] dark:border-dark-border bg-[#FBF9F4] dark:bg-dark-card rounded-t-2xl flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A] flex items-center justify-center flex-shrink-0 border border-[#E8E2D5] dark:border-dark-border">
                  {editingProduct?.images?.[0] ? (
                    <img src={editingProduct.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : editingProduct ? (
                    <Edit size={18} />
                  ) : (
                    <Plus size={18} />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-[#1B2A4A] dark:text-white leading-tight">
                    {editingProduct ? 'Редактировать товар' : 'Новый товар'}
                  </h2>
                  <p className="text-xs text-[#8A8275] dark:text-gray-300 truncate mt-0.5">
                    {editingProduct
                      ? editingProduct.name_ru
                      : 'Заполните карточку — товар появится в приложении'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {editingProduct && (
                  <button
                    onClick={() => openDuplicateModal(editingProduct)}
                    title="Создать копию товара"
                    className="p-2 rounded-lg bg-[#C9A961]/10 dark:bg-gold/20 text-[#C9A961] dark:text-gold hover:bg-[#C9A961]/20 dark:hover:bg-gold/30 transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                )}
                <button
                  onClick={() => !saving && setShowModal(false)}
                  disabled={saving}
                  className="p-2 rounded-lg text-[#8A8275] dark:text-gray-300 hover:bg-[#F5F1E8] dark:hover:bg-dark-accent transition-colors disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* ✅ Тело модалки с секциями */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F5F1E8] dark:bg-dark-bg">
              {/* 1. Основное */}
              <ModalSection
                icon={<Info size={18} />}
                title="Основное"
                subtitle="Название и описание на двух языках"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel text="Название" flag="RU" required />
                    <input
                      type="text"
                      value={nameRu}
                      onChange={(e) => { setNameRu(e.target.value); clearError('nameRu') }}
                      placeholder="Например: Loro Piana Summer Walk"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white placeholder:text-[#8A8275] dark:placeholder:text-gray-500 text-sm ${
                        errors.nameRu ? 'border-[#9B3B3B] dark:border-red-400 focus:border-[#9B3B3B] dark:focus:border-red-400' : 'border-[#E8E2D5] dark:border-dark-border focus:border-[#1B2A4A] dark:focus:border-gold'
                      }`}
                    />
                    {errors.nameRu && <p className="text-xs text-[#9B3B3B] dark:text-red-400 mt-1">{errors.nameRu}</p>}
                  </div>
                  <div>
                    <FieldLabel text="Название" flag="UZ" hint="если пусто, будет как RU" />
                    <input
                      type="text"
                      value={nameUz}
                      onChange={(e) => setNameUz(e.target.value)}
                      placeholder="Masalan: Loro Piana Summer Walk"
                      className="w-full px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white placeholder:text-[#8A8275] dark:placeholder:text-gray-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <FieldLabel text="Описание" flag="RU" />
                    <textarea
                      value={descriptionRu}
                      onChange={(e) => setDescriptionRu(e.target.value)}
                      placeholder="Описание товара..."
                      rows={3}
                      className="w-full px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white placeholder:text-[#8A8275] dark:placeholder:text-gray-500 text-sm resize-none"
                    />
                  </div>
                  <div>
                    <FieldLabel text="Описание" flag="UZ" />
                    <textarea
                      value={descriptionUz}
                      onChange={(e) => setDescriptionUz(e.target.value)}
                      placeholder="Mahsulot tavsifi..."
                      rows={3}
                      className="w-full px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white placeholder:text-[#8A8275] dark:placeholder:text-gray-500 text-sm resize-none"
                    />
                  </div>
                </div>
              </ModalSection>

              {/* 2. Категория и бренд */}
              <ModalSection
                icon={<Tag size={18} />}
                title="Категория и бренд"
                subtitle="От подкатегории зависит набор размеров"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <FieldLabel text="Категория" required />
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value)
                        setSubcategory('')
                        setSelectedSizes({})
                        setSizesByColor({})
                      }}
                      className="w-full px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white text-sm"
                    >
                      {getFormCategories().map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name_ru}{!cat.is_active ? ' (скрыто)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <FieldLabel text="Подкатегория" required />
                    <select
                      value={subcategory}
                      onChange={(e) => handleSubcategoryChange(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white text-sm ${
                        errors.subcategory ? 'border-[#9B3B3B] dark:border-red-400 focus:border-[#9B3B3B] dark:focus:border-red-400' : 'border-[#E8E2D5] dark:border-dark-border focus:border-[#1B2A4A] dark:focus:border-gold'
                      }`}
                    >
                      <option value="">Выберите подкатегорию</option>
                      {getFormSubcategories().length > 0 ? (
                        getFormSubcategories().map(sub => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name_ru}{!sub.is_active ? ' (скрыто)' : ''}
                          </option>
                        ))
                      ) : (
                        getHardcodedSubcategories().map(sub => (
                          <option key={sub.value} value={sub.value}>{sub.label}</option>
                        ))
                      )}
                    </select>
                    {errors.subcategory && <p className="text-xs text-[#9B3B3B] dark:text-red-400 mt-1">{errors.subcategory}</p>}
                  </div>
                  <div>
                    <FieldLabel text="Бренд" />
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white text-sm"
                    >
                      <option value="">Не выбран</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </ModalSection>

              {/* 3. Цены */}
              <ModalSection
                icon={<DollarSign size={18} />}
                title="Цены"
                subtitle="Основная цена и цена со скидкой, в USD"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel text="Цена" required />
                    <div className="relative">
                      <input
                        type="number"
                        value={priceUsd}
                        onChange={(e) => { setPriceUsd(e.target.value); clearError('priceUsd') }}
                        placeholder="95"
                        min="0"
                        step="0.01"
                        className={`w-full px-4 py-3 pr-10 border rounded-xl focus:outline-none bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white font-bold text-base ${
                          errors.priceUsd ? 'border-[#9B3B3B] dark:border-red-400 focus:border-[#9B3B3B] dark:focus:border-red-400' : 'border-[#E8E2D5] dark:border-dark-border focus:border-[#1B2A4A] dark:focus:border-gold'
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8275] dark:text-gray-400 font-bold">$</span>
                    </div>
                    {errors.priceUsd && <p className="text-xs text-[#9B3B3B] dark:text-red-400 mt-1">{errors.priceUsd}</p>}
                  </div>
                  <div>
                    <FieldLabel text="Цена со скидкой" hint="пусто = без скидки" />
                    <div className="relative">
                      <input
                        type="number"
                        value={salePriceUsd}
                        onChange={(e) => { setSalePriceUsd(e.target.value); clearError('salePriceUsd') }}
                        placeholder="Пусто = без скидки"
                        min="0"
                        step="0.01"
                        className={`w-full px-4 py-3 pr-10 border rounded-xl focus:outline-none bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white font-bold text-base ${
                          errors.salePriceUsd ? 'border-[#9B3B3B] dark:border-red-400 focus:border-[#9B3B3B] dark:focus:border-red-400' : 'border-[#9B3B3B]/40 dark:border-red-500/40 focus:border-[#9B3B3B] dark:focus:border-red-400'
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8275] dark:text-gray-400 font-bold">$</span>
                    </div>
                    {errors.salePriceUsd ? (
                      <p className="text-xs text-[#9B3B3B] dark:text-red-400 mt-1">{errors.salePriceUsd}</p>
                    ) : discountPercent !== null ? (
                      <p className="text-xs text-[#9B3B3B] dark:text-red-400 mt-1 font-bold">
                         Скидка {discountPercent}% от основной цены
                      </p>
                    ) : null}
                  </div>
                </div>
              </ModalSection>

              {/* 4. Фото */}
              <ModalSection
                icon={<ImageIcon size={18} />}
                title="Фото товара"
                subtitle="Общие фото (если у товара нет цветов)"
                right={
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    images.length >= MAX_IMAGES
                      ? 'bg-[#9B3B3B]/10 dark:bg-red-500/20 text-[#9B3B3B] dark:text-red-400'
                      : 'bg-[#F5F1E8] dark:bg-dark-accent text-[#1B2A4A] dark:text-white'
                  }`}>
                    {images.length}/{MAX_IMAGES}
                  </span>
                }
              >
                <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors bg-white dark:bg-dark-accent ${
                  uploading ? 'border-[#1B2A4A] dark:border-gold' : 'border-[#E8E2D5] dark:border-dark-border hover:border-[#C9A961] dark:hover:border-gold'
                }`}>
                  <div className="w-11 h-11 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center">
                    {uploading
                      ? <Loader2 size={20} className="text-[#1B2A4A] dark:text-white animate-spin" />
                      : <Upload size={20} className="text-[#1B2A4A] dark:text-white" />}
                  </div>
                  <span className="text-sm font-bold text-[#1B2A4A] dark:text-white">
                    {uploading ? 'Загрузка...' : 'Загрузить фото'}
                  </span>
                  <span className="text-xs text-[#8A8275] dark:text-gray-300">
                    PNG/JPG, можно несколько сразу · максимум {MAX_IMAGES}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>

                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-xl overflow-hidden border border-[#E8E2D5] dark:border-dark-border bg-white dark:bg-dark-accent"
                      >
                        <img src={img} alt={`Фото ${idx + 1}`} className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A] text-[10px] font-bold shadow">
                            Обложка
                          </span>
                        )}
                        <div className="absolute top-1.5 right-1.5 flex gap-1">
                          {idx !== 0 && (
                            <button
                              onClick={() => makeCover(idx)}
                              title="Сделать обложкой"
                              className="p-1.5 rounded-full bg-white/95 dark:bg-dark-card text-[#1B2A4A] dark:text-white hover:bg-[#C9A961] hover:text-white dark:hover:bg-gold shadow transition-colors"
                            >
                              <Star size={13} />
                            </button>
                          )}
                          <button
                            onClick={() => removeImage(idx)}
                            title="Удалить фото"
                            className="p-1.5 rounded-full bg-[#9B3B3B] dark:bg-red-600 text-white shadow hover:bg-[#7a2f2f] dark:hover:bg-red-700 transition-colors"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ModalSection>

              {/* ✅ 5. ЦВЕТА (вариации) */}
              <ModalSection
                icon={<Palette size={18} />}
                title="Цвета"
                subtitle="Каждый цвет: свои фото и свои остатки размеров"
                right={
                  <button
                    type="button"
                    onClick={addColor}
                    className="px-3 py-1.5 bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A] rounded-lg text-xs font-bold hover:bg-[#142038] dark:hover:bg-[#d6b57e] transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Добавить цвет
                  </button>
                }
              >
                {productColors.length === 0 ? (
                  <div className="flex items-center gap-3 p-3 bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-white dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
                      <Palette size={16} className="text-[#8A8275] dark:text-gray-300" />
                    </div>
                    <p className="text-sm text-[#1B2A4A] dark:text-white">
                      У товара пока нет цветов — остатки указываются ниже в общей сетке размеров.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {productColors.map((color, colorIdx) => (
                      <div
                        key={color.id}
                        className={`border rounded-xl p-3 bg-white dark:bg-dark-card transition-colors ${
                          activeColorId === color.id
                            ? 'border-[#1B2A4A] dark:border-gold'
                            : 'border-[#E8E2D5] dark:border-dark-border'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <input
                            type="color"
                            value={color.hex_code || '#1B2A4A'}
                            onChange={(e) => updateColor(colorIdx, 'hex_code', e.target.value)}
                            className="w-10 h-10 rounded-lg border border-[#E8E2D5] dark:border-dark-border cursor-pointer bg-transparent flex-shrink-0"
                            title="Цвет кружка в приложении"
                          />
                          <input
                            type="text"
                            value={color.name_ru}
                            onChange={(e) => updateColor(colorIdx, 'name_ru', e.target.value)}
                            placeholder="Название RU RU *"
                            className="flex-1 min-w-0 px-3 py-2 border border-[#E8E2D5] dark:border-dark-border rounded-lg bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white text-sm focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold"
                          />
                          <input
                            type="text"
                            value={color.name_uz || ''}
                            onChange={(e) => updateColor(colorIdx, 'name_uz', e.target.value)}
                            placeholder="Название UZ UZ"
                            className="flex-1 min-w-0 px-3 py-2 border border-[#E8E2D5] dark:border-dark-border rounded-lg bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white text-sm focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold"
                          />
                          <button
                            type="button"
                            onClick={() => removeColor(colorIdx)}
                            className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-[#9B3B3B] dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex-shrink-0"
                            title="Удалить цвет"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Фото цвета */}
                        <label className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-xl p-2.5 cursor-pointer transition-colors ${
                          uploading ? 'border-[#1B2A4A] dark:border-gold' : 'border-[#E8E2D5] dark:border-dark-border hover:border-[#C9A961] dark:hover:border-gold'
                        }`}>
                          <Upload size={14} className="text-[#8A8275] dark:text-gray-300" />
                          <span className="text-xs text-[#8A8275] dark:text-gray-300">
                            Загрузить фото цвета «{color.name_ru || 'без названия'}»
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleColorImagesUpload(colorIdx, e)}
                            className="hidden"
                            disabled={uploading}
                          />
                        </label>
                        {color.images && color.images.length > 0 && (
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 mt-2">
                            {color.images.map((img, imgIdx) => (
                              <div key={imgIdx} className="relative aspect-square rounded-lg overflow-hidden border border-[#E8E2D5] dark:border-dark-border">
                                <img src={img} alt="" className="w-full h-full object-cover" />
                                {imgIdx === 0 && (
                                  <span className="absolute top-0.5 left-0.5 px-1 py-0.5 bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A] text-[8px] font-bold rounded">
                                    Обл.
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeColorImage(colorIdx, imgIdx)}
                                  className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-[#9B3B3B] text-white"
                                  title="Удалить фото"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ModalSection>

              {/* 6. Размеры и остатки */}
              <ModalSection
                icon={<Ruler size={18} />}
                title="Размеры и остатки"
                subtitle={
                  !subcategory
                    ? 'Сначала выберите подкатегорию'
                    : productColors.length > 0 && activeColorId
                      ? `${getSubcategoryLabel(category, subcategory)} · цвет: ${productColors.find(c => c.id === activeColorId)?.name_ru || '—'}`
                      : `${getSubcategoryLabel(category, subcategory)} · тип: ${sizeType === 'one_size' ? 'one size' : sizeType}`
                }
                right={
                  sizeType !== 'one_size' && subcategory ? (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      totalStock > 0
                        ? 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300'
                        : 'bg-[#F5F1E8] dark:bg-dark-accent text-[#8A8275] dark:text-gray-300'
                    }`}>
                      Всего: {totalStock} шт.
                    </span>
                  ) : undefined
                }
              >
                {!subcategory ? (
                  <div className="flex items-center gap-3 p-3 bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-white dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
                      <Lightbulb size={18} />
                    </div>
                    <p className="text-sm text-[#1B2A4A] dark:text-white">
                      Выберите подкатегорию в секции «Категория и бренд» — здесь появятся нужные размеры.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* ✅ Вкладки цветов (если цвета есть) */}
                    {productColors.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mb-3">
                        {productColors.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setActiveColorId(c.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              activeColorId === c.id
                                ? 'bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A]'
                                : 'bg-[#F5F1E8] dark:bg-dark-accent text-[#8A8275] dark:text-gray-300 border border-[#E8E2D5] dark:border-dark-border'
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-[#E8E2D5] dark:border-dark-border flex-shrink-0"
                              style={{ backgroundColor: c.hex_code || '#1B2A4A' }}
                            />
                            {c.name_ru || 'Без названия'}
                          </button>
                        ))}
                      </div>
                    )}

                    {sizeType === 'one_size' ? (
                      <div>
                        <FieldLabel text="Остаток (One Size)" />
                        <input
                          type="number"
                          value={currentSizesMap()['One Size'] || 0}
                          onChange={(e) => updateStock('One Size', parseInt(e.target.value) || 0)}
                          placeholder="Количество"
                          min="0"
                          className="w-full px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white font-bold"
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {getAvailableSizes().map(size => {
                          const active = currentSizesMap()[size] !== undefined
                          const stock = currentSizesMap()[size] ?? 0
                          return (
                            <div
                              key={size}
                              className={`rounded-xl border p-2 transition-colors ${
                                active
                                  ? 'border-[#1B2A4A] dark:border-gold bg-white dark:bg-dark-card shadow-sm'
                                  : 'border-dashed border-[#E8E2D5] dark:border-dark-border bg-[#F5F1E8]/60 dark:bg-dark-accent/60'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => toggleSize(size)}
                                className="w-full flex items-center justify-between gap-1 mb-1.5"
                              >
                                <span className={`text-sm font-bold ${active ? 'text-[#1B2A4A] dark:text-white' : 'text-[#8A8275] dark:text-gray-400'}`}>
                                  {size}
                                </span>
                                {active
                                  ? <CheckCircle2 size={14} className="text-[#1B2A4A] dark:text-gold" />
                                  : <Circle size={14} className="text-[#C9C4B8] dark:text-gray-500" />}
                              </button>
                              {active ? (
                                <>
                                  <input
                                    type="number"
                                    min="0"
                                    value={stock}
                                    onChange={(e) => updateStock(size, parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-full p-1.5 text-sm border border-[#E8E2D5] dark:border-dark-border rounded-lg focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white font-bold"
                                  />
                                  <p className={`text-[10px] mt-1 font-medium ${stock > 0 ? 'text-green-700 dark:text-green-400' : 'text-[#9B3B3B] dark:text-red-400'}`}>
                                    {stock > 0 ? `В наличии: ${stock}` : 'Нет в наличии'}
                                  </p>
                                </>
                              ) : (
                                <p className="text-[10px] text-[#8A8275] dark:text-gray-400">Не выбран</p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </>
                )}
              </ModalSection>
            </div>

            {/* ✅ Sticky-футер */}
            <div className="flex gap-3 px-5 py-4 border-t border-[#E8E2D5] dark:border-dark-border bg-[#FBF9F4] dark:bg-dark-card rounded-b-2xl flex-shrink-0">
              <button
                onClick={() => !saving && setShowModal(false)}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border rounded-xl font-bold text-[#1B2A4A] dark:text-white hover:bg-[#E8E2D5] dark:hover:bg-dark-border transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A] rounded-xl font-bold hover:bg-[#142038] dark:hover:bg-[#d6b57e] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {editingProduct ? 'Сохранить изменения' : 'Добавить товар'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
