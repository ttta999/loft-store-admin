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

// ✅ УМНЫЕ РАЗМЕРЫ ПО ПОДКАТЕГОРИЯМ
const SUBCATEGORY_SIZE_CONFIG: Record<string, { type: string; range: string[] }> = {
  // Обувь → числовые размеры 38-47
  'sneakers': { type: 'numeric', range: ['38', '39', '40', '41', '42', '43', '44', '45', '46', '47'] },
  'boots': { type: 'numeric', range: ['38', '39', '40', '41', '42', '43', '44', '45', '46', '47'] },
  'loafers': { type: 'numeric', range: ['38', '39', '40', '41', '42', '43', '44', '45', '46', '47'] },
  'sandals-shlapantsy': { type: 'numeric', range: ['38', '39', '40', '41', '42', '43', '44', '45', '46', '47'] },
  
  // Футболки, рубашки, джемперы → буквенные XS-XXL
  't-shirts': { type: 'alphabetical', range: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  'shirts': { type: 'alphabetical', range: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  'sweaters-cardigans': { type: 'alphabetical', range: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  
  // ✅ Брюки, джинсы → числовые 44-56 + буквенные XS-XXL
  'pants': { type: 'combined', range: ['44', '46', '48', '50', '52', '54', '56', 'XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  'jeans': { type: 'combined', range: ['44', '46', '48', '50', '52', '54', '56', 'XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  
  // Спортивные костюмы → буквенные S-XXL
  'tracksuits': { type: 'alphabetical', range: ['S', 'M', 'L', 'XL', 'XXL'] },
  
  // Верхняя одежда → буквенные S-XXL
  'outerwear': { type: 'alphabetical', range: ['S', 'M', 'L', 'XL', 'XXL'] },
  
  // ✅ Ремни → буквенные S-XL + числовые 80-130
  'belts': { type: 'combined', range: ['S', 'M', 'L', 'XL', '80', '85', '90', '95', '100', '105', '110', '115', '120', '125', '130'] },
  
  // Аксессуары → One Size
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
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'active' | 'hidden'>('all')
  
  const [showModal, setShowModal] = useState(false)
  const [showBrandModal, setShowBrandModal] = useState(false)
  const [newBrandName, setNewBrandName] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  // Форма товара
  const [nameRu, setNameRu] = useState('')
  const [nameUz, setNameUz] = useState('')
  const [descriptionRu, setDescriptionRu] = useState('')
  const [descriptionUz, setDescriptionUz] = useState('')
  const [category, setCategory] = useState('shoes')
  const [subcategory, setSubcategory] = useState('')
  const [brand, setBrand] = useState('')
  const [priceUsd, setPriceUsd] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [sizeType, setSizeType] = useState('numeric')
  const [uploading, setUploading] = useState(false)
  
  // Варианты (размеры)
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
    setImages(product.images || [])
    setSizeType(product.size_type || 'numeric')
    
    // Загружаем текущие размеры
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
        const { data, error } = await supabase
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

  // ✅ Добавление нового бренда
  const handleAddBrand = async () => {
    if (!newBrandName.trim()) {
      alert('Введите название бренда')
      return
    }

    try {
      const { data: brandData, error } = await supabase
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

      setBrands(prev => [...prev, brandData])
      setBrand(brandData.name)
      setNewBrandName('')
      setShowBrandModal(false)
      alert('Бренд добавлен! ✅')
    } catch (error: any) {
      console.error('Ошибка:', error)
      alert('Ошибка при добавлении бренда')
    }
  }

  // ✅ При выборе подкатегории - устанавливаем правильные размеры
  const handleSubcategoryChange = (newSubcategory: string) => {
    setSubcategory(newSubcategory)
    
    const config = SUBCATEGORY_SIZE_CONFIG[newSubcategory]
    if (config) {
      setSizeType(config.type)
      setSelectedSizes({}) // Сбрасываем выбранные размеры
    }
  }

  // ✅ Получаем доступные размеры для текущей подкатегории
  const getAvailableSizes = () => {
    const config = SUBCATEGORY_SIZE_CONFIG[subcategory]
    if (config && config.range.length > 0) {
      return config.range
    }
    
    // Fallback на стандартные размеры
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

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name_ru.toLowerCase().includes(search.toLowerCase()) ||
                         p.name_uz.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter
    const matchesVisibility = visibilityFilter === 'all' || 
                             (visibilityFilter === 'active' && p.is_active !== false) ||
                             (visibilityFilter === 'hidden' && p.is_active === false)
    return matchesSearch && matchesCategory && matchesVisibility
  })

  const activeCount = products.filter(p => p.is_active !== false).length
  const hiddenCount = products.filter(p => p.is_active === false).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-500">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b p-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-4"
          >
            <ArrowLeft size={20} />
            <span>На главную</span>
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">📦 Управление товарами</h1>
            <button
              onClick={openAddModal}
              className="bg-black text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-800"
            >
              <Plus size={20} />
              Добавить товар
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white p-4 rounded-xl mb-4">
          <div className="flex gap-4 flex-wrap mb-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по названию..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap mb-3">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                categoryFilter === 'all' ? 'bg-black text-white' : 'bg-gray-100'
              }`}
            >
              Все категории ({products.length})
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  categoryFilter === cat.value ? 'bg-black text-white' : 'bg-gray-100'
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
                visibilityFilter === 'all' ? 'bg-black text-white' : 'bg-gray-100'
              }`}
            >
              Все ({products.length})
            </button>
            <button
              onClick={() => setVisibilityFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1 ${
                visibilityFilter === 'active' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'
              }`}
            >
              <Eye size={16} />
              Видимые ({activeCount})
            </button>
            <button
              onClick={() => setVisibilityFilter('hidden')}
              className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1 ${
                visibilityFilter === 'hidden' ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              <EyeOff size={16} />
              Скрытые ({hiddenCount})
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredProducts.map((product) => {
            const productVariants = variants.filter(v => v.product_id === product.id)
            const totalStock = productVariants.reduce((sum, v) => sum + v.stock, 0)
            const isActive = product.is_active !== false
            
            return (
              <div 
                key={product.id} 
                className={`bg-white rounded-xl p-4 shadow-sm ${!isActive ? 'opacity-60 border-2 border-yellow-200' : ''}`}
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
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          {product.name_ru}
                          {!isActive && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                              🙈 Скрыт
                            </span>
                          )}
                        </h3>
                        {product.name_uz && product.name_uz !== product.name_ru && (
                          <p className="text-sm text-gray-500">{product.name_uz}</p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">
                          {CATEGORIES.find(c => c.value === product.category)?.label || product.category}
                          {product.subcategory && ` → ${getSubcategories().find(s => s.value === product.subcategory)?.label || product.subcategory}`}
                        </p>
                        {product.brand && (
                          <p className="text-sm text-purple-600 mt-1">
                            🏷️ {product.brand}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">${product.price_usd}</p>
                        <p className="text-sm text-gray-500">
                          Остаток: {totalStock} шт.
                        </p>
                      </div>
                    </div>
                    
                    {productVariants.length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-2">
                        {productVariants.map(v => (
                          <span
                            key={v.id}
                            className="px-2 py-1 bg-gray-100 rounded text-xs"
                          >
                            {v.size_value}: {v.stock} шт.
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <button
                        onClick={() => openEditModal(product)}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium hover:bg-blue-200 flex items-center gap-1"
                      >
                        <Edit size={16} />
                        Редактировать
                      </button>
                      <button
                        onClick={() => toggleActive(product.id, isActive)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 ${
                          isActive
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
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
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm font-medium hover:bg-red-200 flex items-center gap-1"
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
            <div className="bg-white rounded-xl p-8 text-center text-gray-500">
              <Package size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Товары не найдены</p>
            </div>
          )}
        </div>
      </div>

      {/* Модалка добавления/редактирования */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingProduct ? 'Редактировать товар' : 'Добавить товар'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-black"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Название (RU) *
                  </label>
                  <input
                    type="text"
                    value={nameRu}
                    onChange={(e) => setNameRu(e.target.value)}
                    placeholder="Например: Loro Piana Summer Walk"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Название (UZ)
                  </label>
                  <input
                    type="text"
                    value={nameUz}
                    onChange={(e) => setNameUz(e.target.value)}
                    placeholder="Masalan: Loro Piana Summer Walk"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Описание (RU)
                  </label>
                  <textarea
                    value={descriptionRu}
                    onChange={(e) => setDescriptionRu(e.target.value)}
                    placeholder="Описание товара..."
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Описание (UZ)
                  </label>
                  <textarea
                    value={descriptionUz}
                    onChange={(e) => setDescriptionUz(e.target.value)}
                    placeholder="Mahsulot tavsifi..."
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Категория *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value)
                      setSubcategory('')
                      setSelectedSizes({})
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Подкатегория *
                  </label>
                  <select
                    value={subcategory}
                    onChange={(e) => handleSubcategoryChange(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  >
                    <option value="">Выберите подкатегорию</option>
                    {getSubcategories().map(sub => (
                      <option key={sub.value} value={sub.value}>{sub.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Бренд
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    >
                      <option value="">Не выбран</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowBrandModal(true)}
                      className="px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-1"
                      title="Добавить бренд"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Цена (USD) *
                  </label>
                  <input
                    type="number"
                    value={priceUsd}
                    onChange={(e) => setPriceUsd(e.target.value)}
                    placeholder="95"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Фото товара
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <label className="flex flex-col items-center justify-center cursor-pointer">
                    <Upload size={32} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">
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
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
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
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Размеры и остатки
                    {subcategory && SUBCATEGORY_SIZE_CONFIG[subcategory] && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({getSubcategories().find(s => s.value === subcategory)?.label})
                      </span>
                    )}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {getAvailableSizes().map(size => (
                      <div key={size} className="border border-gray-300 rounded-lg p-2">
                        <label className="flex items-center gap-2 mb-1">
                          <input
                            type="checkbox"
                            checked={selectedSizes[size] !== undefined}
                            onChange={() => toggleSize(size)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm font-medium">{size}</span>
                        </label>
                        {selectedSizes[size] !== undefined && (
                          <input
                            type="number"
                            value={selectedSizes[size]}
                            onChange={(e) => updateStock(size, parseInt(e.target.value) || 0)}
                            placeholder="Остаток"
                            className="w-full p-1 border border-gray-300 rounded text-sm"
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
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Остаток (One Size)
                  </label>
                  <input
                    type="number"
                    value={selectedSizes['One Size'] || 0}
                    onChange={(e) => updateStock('One Size', parseInt(e.target.value) || 0)}
                    placeholder="Количество"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    min="0"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 rounded-lg font-medium"
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800"
              >
                {editingProduct ? 'Сохранить изменения' : 'Добавить товар'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка добавления бренда */}
      {showBrandModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Добавить бренд</h2>
              <button
                onClick={() => {
                  setShowBrandModal(false)
                  setNewBrandName('')
                }}
                className="text-gray-500 hover:text-black"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Название бренда *
                </label>
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="Например: Gucci"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowBrandModal(false)
                    setNewBrandName('')
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 rounded-lg font-medium"
                >
                  Отмена
                </button>
                <button
                  onClick={handleAddBrand}
                  className="flex-1 px-4 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800"
                >
                  Добавить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}