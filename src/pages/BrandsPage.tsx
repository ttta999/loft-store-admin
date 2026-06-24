import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Plus, Trash2, ToggleLeft, ToggleRight, Edit2 } from 'lucide-react'
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
  const [showAddModal, setShowAddModal] = useState(false)
  const [newBrandName, setNewBrandName] = useState('')
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)

  useEffect(() => {
    loadBrands()
  }, [])

  const loadBrands = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name')

      if (error) throw error
      setBrands(data || [])
    } catch (error) {
      console.error('Ошибка загрузки брендов:', error)
      toast.error('Ошибка загрузки брендов')
    }
    setLoading(false)
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
      await loadBrands()
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
      await loadBrands()
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
      await loadBrands()
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
      await loadBrands()
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
      <Toaster position="top-center" richColors />
      
      <div className="bg-white border-b p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-4"
          >
            <ArrowLeft size={20} />
            <span>На главную</span>
          </button>
          <h1 className="text-2xl font-bold">🏷️ Управление брендами</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Все бренды</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800"
            >
              <Plus size={20} />
              Добавить бренд
            </button>
          </div>

          <div className="space-y-2">
            {brands.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Брендов пока нет. Добавьте первый!
              </p>
            ) : (
              brands.map((brand) => (
                <div
                  key={brand.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    brand.is_active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-1">
                      <h3 className="font-medium">{brand.name}</h3>
                      <p className="text-sm text-gray-500">
                        Создан: {new Date(brand.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleBrand(brand)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${
                        brand.is_active 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {brand.is_active ? (
                        <>
                          <ToggleRight size={16} />
                          Активен
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={16} />
                          Неактивен
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setEditingBrand(brand)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      onClick={() => handleDeleteBrand(brand)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold mb-2">💡 Подсказка</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Активные бренды показываются в приложении</li>
            <li>• Неактивные бренды скрыты, но товары остаются</li>
            <li>• Удаление бренда не удаляет товары</li>
          </ul>
        </div>
      </div>

      {/* Модальное добавления бренда */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Добавить бренд</h2>
            <input
              type="text"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              placeholder="Название бренда"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddBrand()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddBrand}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium"
              >
                Добавить
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewBrandName('')
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное редактирования */}
      {editingBrand && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Редактировать бренд</h2>
            <input
              type="text"
              value={editingBrand.name}
              onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
              placeholder="Название бренда"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleEditBrand()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleEditBrand}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium"
              >
                Сохранить
              </button>
              <button
                onClick={() => setEditingBrand(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium"
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