import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  ArrowLeft, Plus, Edit, Trash2, Search, Package, Upload, X, Eye, EyeOff,
  Copy, Star, Loader2, CheckCircle2, Circle, Info, Tag, DollarSign, Ruler,
  Image as ImageIcon, Save,
} from 'lucide-react'

const CATEGORIES = [
  {
    value: 'shoes',
    label: 'Обувь 👟',
    subcategories: [
      { value: 'sneakers', label: 'Кроссовки' },
      { value: 'boots', label: 'Ботинки' },
      { value: 'loafers', label: 'Лоферы' },
      { value: 'sandals-shlapantsy', label: 'Сандали и Шлепанцы' },
    ]
  },
  {
    value: 'clothes',
    label: 'Одежда 👕',
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
    label: 'Аксессуары 🧢',
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
}

interface Brand {
  id: string
  name: string
}

// ✅ Секция модалки: карточка с иконкой, заголовком и подзаголовком
function Section({ icon, title, subtitle, right, children }: {
  icon: React.ReactNode
  title: string
  subtitle?: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="bg-white rounded-xl border border-[#E8E2D5] p-4">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#1B2A4A]/5 flex items-center justify-center text-[#1B2A4A] flex-shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-[#1B2A4A] leading-tight">{title}</h3>
            {subtitle && <p className="text-xs text-[#8A8275] mt-0.5 truncate">{subtitle}</p>}
          </div>
        </div>
        {right}
      </div>
      {children}
    </section>
  )
}

// ✅ Подпись поля с флажком и звёздочкой обязательности
function FieldLabel({ text, flag, required, hint }: { text: string; flag?: string; required?: boolean; hint?: string }) {
  return (
    <label className="flex items-center gap-1.5 text-sm font-medium text-[#1B2A4A] mb-1.5">
      <span>{text}</span>
      {flag && <span className="text-base leading-none">{flag}</span>}
      {required && <span className="text-[#9B3B3B]">*</span>}
      {hint && <span className="text-xs font-normal text-[#8A8275]">— {hint}</span>}
    </label>
  )
}

export default function ProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
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
  const [selectedSizes, setSelectedSizes] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadProducts()
    loadBrands()
  }, [])

  const loadBrands = async () => {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name')
    if (!error && data) {
      setBrands(data)
    }
  }

  const loadProducts = async () => {
    setLoading(true)
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      if (productsError) throw productsError
      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
      if (variantsError) throw variantsError
      setProducts(productsData || [])
      setVariants(variantsData || [])
    } catch (error) {
      console.error('Ошибка загрузки:', error)
      alert('Ошибка при загрузке товаров')
    }
    setLoading(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const remaining = MAX_IMAGES - images.length
    if (remaining <= 0) {
      alert(`Максимум ${MAX_IMAGES} фото`)
      return
    }
    const filesToUpload = Array.from(files).slice(0, remaining)
    if (files.length > remaining) {
      alert(`Загрузим первые ${remaining} фото — лимит ${MAX_IMAGES}`)
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
          alert('Ошибка загрузки фото')
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
      alert('Ошибка при загрузке')
    }
    setUploading(false)
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  // ✅ Сделать фото обложкой (переместить первым)
  const makeCover = (index: number) => {
    setImages(prev => [prev[index], ...prev.filter((_, i) => i !== index)])
  }

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
    setErrors({})
  }

  const openAddModal = () => {
    resetForm()
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
    const productVariants = variants.filter(v => v.product_id === product.id)
    const sizesMap: Record<string, number> = {}
    productVariants.forEach(v => {
      sizesMap[v.size_value] = v.stock
    })
    setSelectedSizes(sizesMap)
    setErrors({})
    setShowModal(true)
  }

  // ✅ Дублировать товар — открывает форму создания с предзаполненными данными
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
    const productVariants = variants.filter(v => v.product_id === product.id)
    const sizesMap: Record<string, number> = {}
    productVariants.forEach(v => {
      sizesMap[v.size_value] = v.stock
    })
    setSelectedSizes(sizesMap)
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
    // ✅ Инлайн-валидация
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
    if (Object.keys(newErrors).length > 0) return

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
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
          .select()
        if (error) {
          console.error('Ошибка Supabase:', error)
          alert(`Ошибка при обновлении: ${error.message}`)
          return
        }
        await supabase
          .from('product_variants')
          .delete()
          .eq('product_id', editingProduct.id)
        const newVariants = Object.entries(selectedSizes)
          .filter(([_, stock]) => stock > 0)
          .map(([size_value, stock]) => ({
            product_id: editingProduct.id,
            size_value,
            stock,
          }))
        if (newVariants.length > 0) {
          const { error: variantsError } = await supabase
            .from('product_variants')
            .insert(newVariants)
          if (variantsError) {
            console.error('Ошибка вариантов:', variantsError)
            alert(`Ошибка при сохранении размеров: ${variantsError.message}`)
            return
          }
        }
        alert('Товар обновлён! ✅')
      } else {
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single()
        if (error) {
          console.error('Ошибка Supabase:', error)
          alert(`Ошибка при создании: ${error.message}`)
          return
        }
        const newVariants = Object.entries(selectedSizes)
          .filter(([_, stock]) => stock > 0)
          .map(([size_value, stock]) => ({
            product_id: newProduct.id,
            size_value,
            stock,
          }))
        if (newVariants.length > 0) {
          const { error: variantsError } = await supabase
            .from('product_variants')
            .insert(newVariants)
          if (variantsError) {
            console.error('Ошибка вариантов:', variantsError)
            alert(`Ошибка при сохранении размеров: ${variantsError.message}`)
            return
          }
        }
        alert('Товар добавлен! ✅')
      }
      setShowModal(false)
      await loadProducts()
    } catch (error: any) {
      console.error('Полная ошибка:', error)
      alert('Ошибка при сохранении: ' + (error?.message || error || 'Неизвестная ошибка'))
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
      alert('Товар удалён! 🗑️')
      await loadProducts()
    } catch (error) {
      console.error('Ошибка:', error)
      alert('Ошибка при удалении')
    }
  }

  const toggleActive = async (productId: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentActive })
        .eq('id', productId)
      if (error) throw error
      alert(currentActive
        ? 'Товар скрыт из основного приложения 🙈'
        : 'Товар снова виден в приложении ✅')
      await loadProducts()
    } catch (error: any) {
      console.error('Ошибка:', error)
      alert('Ошибка: ' + (error?.message || 'Неизвестная ошибка'))
    }
  }

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => {
      const newSizes = { ...prev }
      if (newSizes[size] !== undefined) {
        delete newSizes[size]
      } else {
        newSizes[size] = 0
      }
      return newSizes
    })
  }

  const updateStock = (size: string, stock: number) => {
    setSelectedSizes(prev => ({
      ...prev,
      [size]: Math.max(0, stock),
    }))
  }

  const handleSubcategoryChange = (newSubcategory: string) => {
    setSubcategory(newSubcategory)
    clearError('subcategory')
    const config = SUBCATEGORY_SIZE_CONFIG[newSubcategory]
    if (config) {
      setSizeType(config.type)
      setSelectedSizes({})
    }
  }

  const getAvailableSizes = () => {
    const config = SUBCATEGORY_SIZE_CONFIG[subcategory]
    if (config && config.range.length > 0) {
      return config.range
    }
    if (sizeType === 'numeric') {
      return ['38', '39', '40', '41', '42', '43', '44', '45', '46', '47']
    }
    if (sizeType === 'alphabetical') {
      return ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    }
    return []
  }

  const getSubcategories = () => {
    const cat = CATEGORIES.find(c => c.value === category)
    return cat?.subcategories || []
  }

  const hasSale = (p: Product) => p.sale_price != null && Number(p.sale_price) > 0

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name_ru.toLowerCase().includes(search.toLowerCase()) ||
      p.name_uz.toLowerCase().includes(search.toLowerCase())
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

  // ✅ Компактный бейдж скидки вместо большого блока предпросмотра
  const baseNum = parseFloat(priceUsd) > 0 ? parseFloat(priceUsd) : null
  const saleNum = parseFloat(salePriceUsd) > 0 ? parseFloat(salePriceUsd) : null
  const discountPercent =
    baseNum && saleNum && saleNum < baseNum
      ? Math.round((1 - saleNum / baseNum) * 100)
      : null

  const totalStock = Object.values(selectedSizes).reduce((sum, s) => sum + s, 0)

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
      <div className="bg-[#FBF9F4] border-b border-[#E8E2D5] p-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[#1B2A4A] hover:text-[#C9A961] mb-4"
          >
            <ArrowLeft size={20} />
            <span>На главную</span>
          </button>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[#1B2A4A]">📦 Управление товарами</h1>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-[#1B2A4A] text-white rounded-lg font-medium hover:bg-[#142038]"
            >
              <Plus size={20} />
              Добавить товар
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-[#FBF9F4] p-4 rounded-xl mb-4 border border-[#E8E2D5]">
          <div className="flex gap-4 flex-wrap mb-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1B2A4A]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по названию..."
                  className="w-full pl-10 pr-4 py-2 border border-[#E8E2D5] rounded-lg focus:outline-none focus:border-[#1B2A4A] bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mb-3">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                categoryFilter === 'all' ? 'bg-[#1B2A4A] text-white' : 'bg-[#E8E2D5] text-[#1B2A4A]'
              }`}
            >
              Все категории ({products.length})
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  categoryFilter === cat.value ? 'bg-[#1B2A4A] text-white' : 'bg-[#E8E2D5] text-[#1B2A4A]'
                }`}
              >
                {cat.label} ({products.filter(p => p.category === cat.value).length})
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setVisibilityFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                visibilityFilter === 'all' ? 'bg-[#1B2A4A] text-white' : 'bg-[#E8E2D5] text-[#1B2A4A]'
              }`}
            >
              Все ({products.length})
            </button>
            <button
              onClick={() => setVisibilityFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1 ${
                visibilityFilter === 'active' ? 'bg-[#1B2A4A] text-white' : 'bg-[#E8E2D5] text-[#1B2A4A]'
              }`}
            >
              <Eye size={16} />
              Видимые ({activeCount})
            </button>
            <button
              onClick={() => setVisibilityFilter('hidden')}
              className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1 ${
                visibilityFilter === 'hidden' ? 'bg-[#C9A961] text-white' : 'bg-[#E8E2D5] text-[#1B2A4A]'
              }`}
            >
              <EyeOff size={16} />
              Скрытые ({hiddenCount})
            </button>
            <button
              onClick={() => setVisibilityFilter('sale')}
              className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1 ${
                visibilityFilter === 'sale' ? 'bg-[#9B3B3B] text-white' : 'bg-[#9B3B3B]/10 text-[#9B3B3B]'
              }`}
            >
              🏷️ Со скидкой ({saleCount})
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredProducts.map((product) => {
            const productVariants = variants.filter(v => v.product_id === product.id)
            const totalStockList = productVariants.reduce((sum, v) => sum + v.stock, 0)
            const isActive = product.is_active !== false
            const sale = hasSale(product)
            return (
              <div
                key={product.id}
                className={`bg-[#FBF9F4] rounded-xl p-4 shadow-sm border border-[#E8E2D5] ${!isActive ? 'opacity-60 border-2 border-[#C9A961]' : ''}`}
              >
                <div className="flex gap-4">
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name_ru}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg flex items-center gap-2 text-[#1B2A4A]">
                          {product.name_ru}
                          {!isActive && (
                            <span className="text-xs bg-[#C9A961]/20 text-[#C9A961] px-2 py-1 rounded-full">
                              🙈 Скрыт
                            </span>
                          )}
                          {sale && (
                            <span className="text-xs bg-[#9B3B3B]/10 text-[#9B3B3B] px-2 py-1 rounded-full">
                              🏷️ Скидка
                            </span>
                          )}
                        </h3>
                        {product.name_uz && product.name_uz !== product.name_ru && (
                          <p className="text-sm text-[#1B2A4A]">{product.name_uz}</p>
                        )}
                        <p className="text-sm text-[#1B2A4A] mt-1">
                          {CATEGORIES.find(c => c.value === product.category)?.label || product.category}
                          {product.subcategory && ` → ${getSubcategories().find(s => s.value === product.subcategory)?.label || product.subcategory}`}
                        </p>
                        {product.brand && (
                          <p className="text-sm text-[#C9A961] mt-1">
                            🏷️ {product.brand}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {sale ? (
                          <>
                            <p className="text-sm text-[#1B2A4A] line-through">${product.price_usd}</p>
                            <p className="text-2xl font-bold text-[#9B3B3B]">${product.sale_price}</p>
                          </>
                        ) : (
                          <p className="text-2xl font-bold text-[#1B2A4A]">${product.price_usd}</p>
                        )}
                        <p className="text-sm text-[#1B2A4A]">
                          Остаток: {totalStockList} шт.
                        </p>
                      </div>
                    </div>

                    {productVariants.length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-2">
                        {productVariants.map(v => (
                          <span
                            key={v.id}
                            className="px-2 py-1 bg-[#E8E2D5] rounded text-xs text-[#1B2A4A]"
                          >
                            {v.size_value}: {v.stock} шт.
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 mt-3 flex-wrap">
                      <button
                        onClick={() => openEditModal(product)}
                        className="px-3 py-1 bg-[#1B2A4A]/10 text-[#1B2A4A] rounded-lg text-sm font-medium hover:bg-[#1B2A4A]/20 flex items-center gap-1"
                      >
                        <Edit size={16} />
                        Редактировать
                      </button>
                      <button
                        onClick={() => toggleActive(product.id, isActive)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 ${
                          isActive
                            ? 'bg-[#C9A961]/10 text-[#C9A961] hover:bg-[#C9A961]/20'
                            : 'bg-[#1B2A4A]/10 text-[#1B2A4A] hover:bg-[#1B2A4A]/20'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <EyeOff size={16} />
                            Скрыть
                          </>
                        ) : (
                          <>
                            <Eye size={16} />
                            Показать
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-3 py-1 bg-[#9B3B3B]/10 text-[#9B3B3B] rounded-lg text-sm font-medium hover:bg-[#9B3B3B]/20 flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {filteredProducts.length === 0 && (
            <div className="bg-[#FBF9F4] rounded-xl p-8 text-center text-[#1B2A4A] border border-[#E8E2D5]">
              <Package size={48} className="mx-auto mb-4 text-[#E8E2D5]" />
              <p>Товары не найдены</p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ МОДАЛКА ТОВАРА — секции, sticky-футер */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FBF9F4] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl">
            {/* Шапка */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-[#E8E2D5] flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#1B2A4A] text-white flex items-center justify-center flex-shrink-0">
                  {editingProduct?.images?.[0] ? (
                    <img src={editingProduct.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : editingProduct ? (
                    <Edit size={18} />
                  ) : (
                    <Plus size={18} />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-[#1B2A4A] leading-tight">
                    {editingProduct ? 'Редактировать товар' : 'Новый товар'}
                  </h2>
                  <p className="text-xs text-[#8A8275] truncate">
                    {editingProduct
                      ? editingProduct.name_ru
                      : 'Заполните карточку — товар появится в приложении'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {editingProduct && (
                  <button
                    onClick={() => openDuplicateModal(editingProduct)}
                    title="Создать копию товара"
                    className="p-2 rounded-lg bg-[#C9A961]/10 text-[#C9A961] hover:bg-[#C9A961]/20 transition-colors"
                  >
                    <Copy size={18} />
                  </button>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg text-[#1B2A4A] hover:bg-[#E8E2D5] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Тело с секциями */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* 1. Основное */}
              <Section
                icon={<Info size={18} />}
                title="Основное"
                subtitle="Название и описание на двух языках"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel text="Название" flag="🇷🇺" required />
                    <input
                      type="text"
                      value={nameRu}
                      onChange={(e) => { setNameRu(e.target.value); clearError('nameRu') }}
                      placeholder="Например: Loro Piana Summer Walk"
                      className={`w-full p-3 border rounded-lg focus:outline-none bg-white text-[#1B2A4A] ${
                        errors.nameRu ? 'border-[#9B3B3B] focus:border-[#9B3B3B]' : 'border-[#E8E2D5] focus:border-[#1B2A4A]'
                      }`}
                    />
                    {errors.nameRu && <p className="text-xs text-[#9B3B3B] mt-1">{errors.nameRu}</p>}
                  </div>
                  <div>
                    <FieldLabel text="Название" flag="🇺" hint="если пусто, будет как RU" />
                    <input
                      type="text"
                      value={nameUz}
                      onChange={(e) => setNameUz(e.target.value)}
                      placeholder="Masalan: Loro Piana Summer Walk"
                      className="w-full p-3 border border-[#E8E2D5] rounded-lg focus:outline-none focus:border-[#1B2A4A] bg-white text-[#1B2A4A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <FieldLabel text="Описание" flag="🇷🇺" />
                    <textarea
                      value={descriptionRu}
                      onChange={(e) => setDescriptionRu(e.target.value)}
                      placeholder="Описание товара..."
                      rows={3}
                      className="w-full p-3 border border-[#E8E2D5] rounded-lg focus:outline-none focus:border-[#1B2A4A] bg-white text-[#1B2A4A] resize-none"
                    />
                  </div>
                  <div>
                    <FieldLabel text="Описание" flag="🇺🇿" />
                    <textarea
                      value={descriptionUz}
                      onChange={(e) => setDescriptionUz(e.target.value)}
                      placeholder="Mahsulot tavsifi..."
                      rows={3}
                      className="w-full p-3 border border-[#E8E2D5] rounded-lg focus:outline-none focus:border-[#1B2A4A] bg-white text-[#1B2A4A] resize-none"
                    />
                  </div>
                </div>
              </Section>

              {/* 2. Категория и бренд */}
              <Section
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
                      }}
                      className="w-full p-3 border border-[#E8E2D5] rounded-lg focus:outline-none focus:border-[#1B2A4A] bg-white text-[#1B2A4A]"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <FieldLabel text="Подкатегория" required />
                    <select
                      value={subcategory}
                      onChange={(e) => handleSubcategoryChange(e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:outline-none bg-white text-[#1B2A4A] ${
                        errors.subcategory ? 'border-[#9B3B3B] focus:border-[#9B3B3B]' : 'border-[#E8E2D5] focus:border-[#1B2A4A]'
                      }`}
                    >
                      <option value="">Выберите подкатегорию</option>
                      {getSubcategories().map(sub => (
                        <option key={sub.value} value={sub.value}>{sub.label}</option>
                      ))}
                    </select>
                    {errors.subcategory && <p className="text-xs text-[#9B3B3B] mt-1">{errors.subcategory}</p>}
                  </div>
                  <div>
                    <FieldLabel text="Бренд" />
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full p-3 border border-[#E8E2D5] rounded-lg focus:outline-none focus:border-[#1B2A4A] bg-white text-[#1B2A4A]"
                    >
                      <option value="">Не выбран</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </Section>

              {/* 3. Цены */}
              <Section
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
                        className={`w-full p-3 pr-10 border rounded-lg focus:outline-none bg-white text-[#1B2A4A] font-bold ${
                          errors.priceUsd ? 'border-[#9B3B3B] focus:border-[#9B3B3B]' : 'border-[#E8E2D5] focus:border-[#1B2A4A]'
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8275] font-medium">$</span>
                    </div>
                    {errors.priceUsd && <p className="text-xs text-[#9B3B3B] mt-1">{errors.priceUsd}</p>}
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
                        className={`w-full p-3 pr-10 border rounded-lg focus:outline-none bg-white text-[#1B2A4A] font-bold ${
                          errors.salePriceUsd ? 'border-[#9B3B3B] focus:border-[#9B3B3B]' : 'border-[#9B3B3B]/40 focus:border-[#9B3B3B]'
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8275] font-medium">$</span>
                    </div>
                    {errors.salePriceUsd ? (
                      <p className="text-xs text-[#9B3B3B] mt-1">{errors.salePriceUsd}</p>
                    ) : discountPercent !== null ? (
                      <p className="text-xs text-[#9B3B3B] mt-1 font-medium">
                        🏷️ Скидка {discountPercent}% от основной цены
                      </p>
                    ) : null}
                  </div>
                </div>
              </Section>

              {/* 4. Фото */}
              <Section
                icon={<ImageIcon size={18} />}
                title="Фото товара"
                subtitle="Первое фото — обложка карточки"
                right={
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    images.length >= MAX_IMAGES ? 'bg-[#9B3B3B]/10 text-[#9B3B3B]' : 'bg-[#1B2A4A]/5 text-[#1B2A4A]'
                  }`}>
                    {images.length}/{MAX_IMAGES}
                  </span>
                }
              >
                <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors bg-white ${
                  uploading ? 'border-[#1B2A4A]' : 'border-[#E8E2D5] hover:border-[#C9A961]'
                }`}>
                  <div className="w-11 h-11 rounded-full bg-[#1B2A4A]/5 flex items-center justify-center">
                    {uploading
                      ? <Loader2 size={20} className="text-[#1B2A4A] animate-spin" />
                      : <Upload size={20} className="text-[#1B2A4A]" />}
                  </div>
                  <span className="text-sm font-medium text-[#1B2A4A]">
                    {uploading ? 'Загрузка...' : 'Загрузить фото'}
                  </span>
                  <span className="text-xs text-[#8A8275]">
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
                        className="relative aspect-square rounded-xl overflow-hidden border border-[#E8E2D5] bg-white"
                      >
                        <img src={img} alt={`Фото ${idx + 1}`} className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-[#1B2A4A] text-white text-[10px] font-bold shadow">
                            Обложка
                          </span>
                        )}
                        <div className="absolute top-1.5 right-1.5 flex gap-1">
                          {idx !== 0 && (
                            <button
                              onClick={() => makeCover(idx)}
                              title="Сделать обложкой"
                              className="p-1.5 rounded-full bg-white/95 text-[#1B2A4A] hover:bg-[#C9A961] hover:text-white shadow transition-colors"
                            >
                              <Star size={13} />
                            </button>
                          )}
                          <button
                            onClick={() => removeImage(idx)}
                            title="Удалить фото"
                            className="p-1.5 rounded-full bg-[#9B3B3B] text-white hover:bg-[#7a2f2f] shadow transition-colors"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* 5. Размеры и остатки */}
              <Section
                icon={<Ruler size={18} />}
                title="Размеры и остатки"
                subtitle={
                  subcategory
                    ? `${getSubcategories().find(s => s.value === subcategory)?.label || subcategory} · тип: ${sizeType === 'one_size' ? 'one size' : sizeType}`
                    : 'Сначала выберите подкатегорию'
                }
                right={
                  sizeType !== 'one_size' && subcategory ? (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      totalStock > 0 ? 'bg-green-100 text-green-800' : 'bg-[#E8E2D5] text-[#8A8275]'
                    }`}>
                      Всего: {totalStock} шт.
                    </span>
                  ) : undefined
                }
              >
                {!subcategory ? (
                  <p className="text-sm text-[#8A8275] bg-[#F5F1E8] border border-[#E8E2D5] rounded-lg p-3">
                    💡 Выберите подкатегорию в секции «Категория и бренд» — здесь появятся нужные размеры.
                  </p>
                ) : sizeType === 'one_size' ? (
                  <div>
                    <FieldLabel text="Остаток (One Size)" />
                    <input
                      type="number"
                      value={selectedSizes['One Size'] || 0}
                      onChange={(e) => updateStock('One Size', parseInt(e.target.value) || 0)}
                      placeholder="Количество"
                      min="0"
                      className="w-full p-3 border border-[#E8E2D5] rounded-lg focus:outline-none focus:border-[#1B2A4A] bg-white text-[#1B2A4A] font-bold"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {getAvailableSizes().map(size => {
                      const active = selectedSizes[size] !== undefined
                      const stock = selectedSizes[size] ?? 0
                      return (
                        <div
                          key={size}
                          className={`rounded-xl border p-2 transition-colors ${
                            active
                              ? 'border-[#1B2A4A] bg-white shadow-sm'
                              : 'border-dashed border-[#E8E2D5] bg-[#F5F1E8]/60'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleSize(size)}
                            className="w-full flex items-center justify-between gap-1 mb-1.5"
                          >
                            <span className={`text-sm font-bold ${active ? 'text-[#1B2A4A]' : 'text-[#8A8275]'}`}>
                              {size}
                            </span>
                            {active
                              ? <CheckCircle2 size={14} className="text-[#1B2A4A]" />
                              : <Circle size={14} className="text-[#C9C4B8]" />}
                          </button>
                          {active ? (
                            <>
                              <input
                                type="number"
                                min="0"
                                value={stock}
                                onChange={(e) => updateStock(size, parseInt(e.target.value) || 0)}
                                placeholder="0"
                                className="w-full p-1.5 text-sm border border-[#E8E2D5] rounded-lg focus:outline-none focus:border-[#1B2A4A] bg-white text-[#1B2A4A] font-bold"
                              />
                              <p className={`text-[10px] mt-1 font-medium ${stock > 0 ? 'text-green-700' : 'text-[#9B3B3B]'}`}>
                                {stock > 0 ? `В наличии: ${stock}` : 'Нет в наличии'}
                              </p>
                            </>
                          ) : (
                            <p className="text-[10px] text-[#8A8275]">Не выбран</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </Section>
            </div>

            {/* ✅ Sticky-футер */}
            <div className="flex gap-3 px-6 py-4 border-t border-[#E8E2D5] bg-[#FBF9F4] rounded-b-2xl flex-shrink-0">
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-[#E8E2D5] rounded-xl font-medium text-[#1B2A4A] hover:bg-[#ddd6c8] transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-[#1B2A4A] text-white rounded-xl font-bold hover:bg-[#142038] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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