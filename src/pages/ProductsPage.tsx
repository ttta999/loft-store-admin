import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Plus, Edit, Trash2, Search, Package, Upload, X } from 'lucide-react'

const CATEGORIES = [
  { 
    value: 'shoes', 
    label: 'Обувь 👟',
    subcategories: [
      { value: 'sneakers', label: 'Кроссовки' },
      { value: 'boots', label: 'Ботинки' },
      { value: 'loafers', label: 'Лоферы' },
      { value: 'sandals', label: 'Сандалии' },
    ]
  },
  { 
    value: 'clothes', 
    label: 'Одежда 👕',
    subcategories: [
      { value: 't-shirts', label: 'Футболки' },
      { value: 'shirts', label: 'Рубашки' },
      { value: 'hoodies', label: 'Худи' },
      { value: 'pants', label: 'Брюки' },
      { value: 'jeans', label: 'Джинсы' },
      { value: 'jackets', label: 'Куртки' },
    ]
  },
  { 
    value: 'accessories', 
    label: 'Аксессуары ⌚',
    subcategories: [
      { value: 'belts', label: 'Ремни' },
      { value: 'bags', label: 'Сумки' },
      { value: 'watches', label: 'Часы' },
      { value: 'sunglasses', label: 'Очки' },
    ]
  },
]

const BRANDS = [
  'Loro Piana',
  'Brunello Cucinelli',
  "Tod's",
  'Hermès',
  'Kiton',
  'Dior',
  'Salvatore Ferragamo',
  'Zegna',
  'Dolce & Gabbana',
  'Fendi',
  'Louis Vuitton',
]

const SIZE_TYPES = [
  { value: 'numeric', label: 'Числовые (40, 41, 42...)' },
  { value: 'alphabetical', label: 'Буквенные (S, M, L, XL...)' },
  { value: 'one_size', label: 'One Size' },
]

const NUMERIC_SIZES = [
  '30', '31', '32', '33', '34', '35', '36', '37', '38', '39',
  '40', '41', '42', '43', '44', '45', '46', '47', '48', '49',
  '50', '51', '52', '53', '54', '55', '56', '57', '58', '59',
  '60', '65', '70', '75', '80', '85', '90', '95', '100', '105',
  '110', '115', '120'
]

const ALPHABETICAL_SIZES = [
  'XXXS', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'
]

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
  created_at: string
}

interface ProductVariant {
  id: string
  product_id: string
  size_value: string
  stock: number
}

export default function ProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  
  const [showModal, setShowModal] = useState(false)
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
  }, [])

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

    // Добавляем бренд только если он выбран
    if (brand) {
      productData.brand = brand
    }

    try {
      if (editingProduct) {
        // Обновление
        console.log('Обновляем товар:', editingProduct.id, productData)
        
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
          .select()
        
        if (error) {
          console.error('Ошибка Supabase:', error)
          const errorMsg = error.message || 'Неизвестная ошибка'
          alert(`Ошибка при обновлении: ${errorMsg}`)
          return
        }
        
        console.log('Товар обновлён:', data)
        
        // Удаляем старые варианты
        await supabase
          .from('product_variants')
          .delete()
          .eq('product_id', editingProduct.id)
        
        // Создаём новые варианты
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
        // Создание
        console.log('Создаём товар:', productData)
        
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single()
        
        if (error) {
          console.error('Ошибка Supabase:', error)
          const errorMsg = error.message || 'Неизвестная ошибка'
          alert(`Ошибка при создании: ${errorMsg}`)
          return
        }
        
        console.log('Товар создан:', newProduct)
        
        // Создаём варианты
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
      // Удаляем варианты
      await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', productId)
      
      // Удаляем товар
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

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name_ru.toLowerCase().includes(search.toLowerCase()) ||
                         p.name_uz.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const getAvailableSizes = () => {
    if (sizeType === 'numeric') return NUMERIC_SIZES
    if (sizeType === 'alphabetical') return ALPHABETICAL_SIZES
    return []
  }

  const getSubcategories = () => {
    const cat = CATEGORIES.find(c => c.value === category)
    return cat?.subcategories || []
  }

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
        {/* Фильтры и поиск */}
        <div className="bg-white p-4 rounded-xl mb-4">
          <div className="flex gap-4 flex-wrap">
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
            <div className="flex gap-2">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  categoryFilter === 'all' ? 'bg-black text-white' : 'bg-gray-100'
                }`}
              >
                Все ({products.length})
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
          </div>
        </div>

        {/* Список товаров */}
        <div className="space-y-4">
          {filteredProducts.map((product) => {
            const productVariants = variants.filter(v => v.product_id === product.id)
            const totalStock = productVariants.reduce((sum, v) => sum + v.stock, 0)
            
            return (
              <div key={product.id} className="bg-white rounded-xl p-4 shadow-sm">
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
                        <h3 className="font-bold text-lg">{product.name_ru}</h3>
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
                    
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => openEditModal(product)}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium hover:bg-blue-200 flex items-center gap-1"
                      >
                        <Edit size={16} />
                        Редактировать
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
              {/* Названия */}
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

              {/* Описания */}
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

              {/* Категория, подкатегория и бренд */}
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
                    onChange={(e) => setSubcategory(e.target.value)}
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
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  >
                    <option value="">Не выбран</option>
                    {BRANDS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Цена и тип размеров */}
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
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Тип размеров *
                  </label>
                  <select
                    value={sizeType}
                    onChange={(e) => {
                      setSizeType(e.target.value)
                      setSelectedSizes({})
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  >
                    {SIZE_TYPES.map(st => (
                      <option key={st.value} value={st.value}>{st.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Загрузка фото */}
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

              {/* Выбор размеров */}
              {sizeType !== 'one_size' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Размеры и остатки
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
    </div>
  )
}