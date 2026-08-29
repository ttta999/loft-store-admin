import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Plus, Edit, Trash2, Search, Package, Upload, X, Eye, EyeOff } from 'lucide-react'

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
  const [showBrandModal, setShowBrandModal] = useState(false)
  const [newBrandName, setNewBrandName] = useState('')
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
    if (!files) return
    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
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
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const openAddModal = () => {
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
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!nameRu || !priceUsd) {
      alert('Название (RU) и цена обязательны!')
      return
    }
    if (!subcategory) {
      alert('Выберите подкатегорию!')
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

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) {
      alert('Введите название бренда')
      return
    }
    try {
      const { data, error } = await supabase
        .from('brands')
        .insert({ name: newBrandName.trim() })
        .select()
        .single()
      if (error) {
        if (error.code === '23505') {
          alert('Такой бренд уже существует')
        } else {
          alert('Ошибка добавления бренда: ' + error.message)
        }
        return
      }
      if (data) {
        setBrands(prev => [...prev, data])
        setBrand(data.name)
      }
      setNewBrandName('')
      setShowBrandModal(false)
      alert('Бренд добавлен! ✅')
    } catch (error) {
      console.error('Ошибка:', error)
      alert('Ошибка при добавлении бренда')
    }
  }

  const handleSubcategoryChange = (newSubcategory: string) => {
    setSubcategory(newSubcategory)
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
    const matchesVisibility =
      visibilityFilter === 'all' ? true :
      visibilityFilter === 'active' ? p.is_active !== false :
      visibilityFilter === 'hidden' ? p.is_active === false :
      hasSale(p)
    return matchesSearch && matchesCategory && matchesVisibility
  })

  const activeCount = products.filter(p => p.is_active !== false).length
  const hiddenCount = products.filter(p => p.is_active === false).length
  const saleCount = products.filter(p => hasSale(p)).length

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B2A4A] mx-auto mb-4"></div>
          <p className="text-[#8A8275]">Загрузка...</p>
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
            className="flex items-center gap-2 text-[#8A8275] hover:text-[#1B2A4A] mb-4"
          >
            <ArrowLeft size={20} />
            <span>На главную</span>
          </button>
          <div className="flex items-center justify-between">
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
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8275]" />
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
            const totalStock = productVariants.reduce((sum, v) => sum + v.stock, 0)
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
                          <p className="text-sm text-[#8A8275]">{product.name_uz}</p>
                        )}
                        <p className="text-sm text-[#8A8275] mt-1">
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
                            <p className="text-sm text-[#8A8275] line-through">${product.price_usd}</p>
                            <p className="text-2xl font-bold text-[#9B3B3B]">${product.sale_price}</p>
                          </>
                        ) : (
                          <p className="text-2xl font-bold text-[#1B2A4A]">${product.price_usd}</p>
                        )}
                        <p className="text-sm text-[#8A8275]">
                          Остаток: {totalStock} шт.
                        </p>
                      </div>
                    </div>

                    {productVariants.length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-2">
                        {productVariants.map(v => (
                          <span
                            key={v.id}
                            className="px-2 py-1 bg-[#F5F1E8] rounded text-xs text-[#1B2A4A] border border-[#E8E2D5]"
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
            <div className="bg-[#FBF9F4] rounded-xl p-8 text-center text-[#8A8275] border border-[#E8E2D5]">
              <Package size={48} className="mx-auto mb-4 text-[#E8E2D5]" />
              <p>Товары не найдены</p>
            </div>
          )}
        </div>
      </div>

      {/* Модалка товара */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FBF9F4] rounded-xl p-6 max-w-2xl w-full my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1B2A4A]">
                {editingProduct ? 'Редактировать товар' : 'Добавить товар'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#8A8275] hover:text-[#1B2A4A]"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#1B2A4A] mb-1 block">
                    Название (RU) *
                  </label>
                  <input
                    type="text"
                    value={nameRu}
                    onChange={(e) => setNameRu(e.target.value)}
                    placeholder="Например: Loro Piana Summer Walk"
                    className="w-full p-3 border border-[#E8E2D5] rounded-lg focus:outline-none focus:border-[#1B2A4A] bg-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1B2A4A] mb-1 block">
                    Название (UZ)
                  </label>
                  <input
                    type="text"
                    value={nameUz}
                    onChange={(e) => setNameUz(e.target.value)}
                    placeholder="Masalan: Loro Piana Summer Walk"
                    className="w-full p-3 border border-[#E8E2D5] rounded-lg focus:outline-none focus:border-[#1B2A4A] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#1B2A4A] mb-1 block">
                    Описание (RU)
                  </label>
                  <textarea
                    value={descriptionRu}
                    onChange={(e) => setDescriptionRu(e.target.value)}
                    placeholder="Описание товара..."
                    rows={2}
                    className="w-full p-3 border border-[#E8E2D5] rounded-lg focus:outline-none focus:border-[#1B2A4A] bg-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1B2A4A] mb-1 block">
                    Описание (UZ)
                  </label>
                  <textarea
                    value={descriptionUz}
                    onChange={(e) => setDescriptionUz(e.target.value)}
                    placeholder="Mahsulot tavsifi..."
                    rows={2}
                    className="w-full p-3 border border-[#E8E2D5] rounded-lg focus:outline-none focus:border-[#1B2A4A] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#1B2A4A] mb-1 block">
                    Категория *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value)
                      setSubcategory('')
                      setSelectedSizes({})
                    }}
                    className="w-full p-3 border border-[#E8E2D5] rounded-lg focus:outline-none focus:border-[#1B2A4A] bg-white"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1B2A4A] mb-1 block">
                    Подкатегория *
                  </label>
                  <select
                    value={subcategory}
                    onChange={(e) => handleSubcategoryChange(e.target.value)}
                    className="w-full p-3 border border-[#E8E2D5] rounded-lg focus:outline-none focus:border-[#1B2A4A] bg-white"
                  >
                    <option value="">Выберите подкатегорию</option>
                    {getSubcategories().map(sub => (
                      <option key={sub.value} value={sub.value}>{sub.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1B2A4A] mb-1 block">
                    Бренд
                  </label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full p-3 border border-[#E8E2D5] rounded-lg focus:outline-none focus:border-[#1B2A4A] bg-white"
                  >
                    <option value="">Не выбран</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#1B2A4A] mb-1 block">
                    Цена (USD) *
                  </label>
                  <input
                    type="number"
                    value={priceUsd}
                    onChange={(e) => setPriceUsd(e.target.value)}
                    placeholder="95"
                    className="w-full p-3 border border-[#E8E2D5] rounded-lg focus:outline-none focus:border-[#1B2A4A] bg-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1B2A4A] mb-1 block">
                    🏷️ Цена со скидкой (USD)
                  </label>
                  <input
                    type="number"
                    value={salePriceUsd}
                    onChange={(e) => setSalePriceUsd(e.target.value)}
                    placeholder="Пусто = без скидки"
                    className="w-full p-3 border border-[#9B3B3B]/40 rounded-lg focus:outline-none focus:border-[#9B3B3B] bg-white"
                  />
                  <p className="text-xs text-[#8A8275] mt-1">
                    Оставь пустым, если скидки нет
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#1B2A4A] mb-1 block">
                  Фото товара
                </label>
                <div className="border-2 border-dashed border-[#E8E2D5] rounded-lg p-4 bg-white">
                  <label className="flex flex-col items-center justify-center cursor-pointer">
                    <Upload size={32} className="text-[#8A8275] mb-2" />
                    <span className="text-sm text-[#8A8275]">
                      {uploading ? 'Загрузка...' : 'Нажмите для загрузки фото'}
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
                </div>
                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={img}
                          alt={`Photo ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 bg-[#9B3B3B] text-white rounded-full p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {sizeType !== 'one_size' && (
                <div>
                  <label className="text-sm font-medium text-[#1B2A4A] mb-2 block">
                    Размеры и остатки
                    {subcategory && SUBCATEGORY_SIZE_CONFIG[subcategory] && (
                      <span className="text-xs text-[#8A8275] ml-2">
                        ({getSubcategories().find(s => s.value === subcategory)?.label})
                      </span>
                    )}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {getAvailableSizes().map(size => (
                      <div key={size} className="border border-[#E8E2D5] rounded-lg p-2 bg-white">
                        <label className="flex items-center gap-2 mb-1">
                          <input
                            type="checkbox"
                            checked={selectedSizes[size] !== undefined}
                            onChange={() => toggleSize(size)}
                            className="w-4 h-4 accent-[#1B2A4A]"
                          />
                          <span className="text-sm font-medium text-[#1B2A4A]">{size}</span>
                        </label>
                        {selectedSizes[size] !== undefined && (
                          <input
                            type="number"
                            value={selectedSizes[size]}
                            onChange={(e) => updateStock(size, parseInt(e.target.value) || 0)}
                            placeholder="Остаток"
                            className="w-full p-1 border border-[#E8E2D5] rounded text-sm"
                            min="0"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {sizeType === 'one_size' && (
                <div>
                  <label className="text-sm font-medium text-[#1B2A4A] mb-1 block">
                    Остаток (One Size)
                  </label>
                  <input
                    type="number"
                    value={selectedSizes['One Size'] || 0}
                    onChange={(e) => updateStock('One Size', parseInt(e.target.value) || 0)}
                    placeholder="Количество"
                    className="w-full p-3 border border-[#E8E2D5] rounded-lg focus:outline-none focus:border-[#1B2A4A] bg-white"
                    min="0"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6 pt-4 border-t border-[#E8E2D5]">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 bg-[#E8E2D5] rounded-lg font-medium text-[#1B2A4A]"
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 bg-[#1B2A4A] text-white rounded-lg font-medium hover:bg-[#142038]"
              >
                {editingProduct ? 'Сохранить изменения' : 'Добавить товар'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка бренда */}
      {showBrandModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-[#FBF9F4] rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-[#1B2A4A]">Добавить бренд</h2>
            <input
              type="text"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              placeholder="Например: Gucci"
              className="w-full p-3 border border-[#E8E2D5] rounded-lg mb-4 bg-white"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddBrand}
                className="flex-1 px-4 py-2 bg-[#1B2A4A] text-white rounded-lg font-medium"
              >
                Добавить
              </button>
              <button
                onClick={() => {
                  setShowBrandModal(false)
                  setNewBrandName('')
                }}
                className="flex-1 px-4 py-2 bg-[#E8E2D5] text-[#1B2A4A] rounded-lg font-medium"
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