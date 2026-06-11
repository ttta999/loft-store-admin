import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getChinaRequests, updateChinaRequestStatus, sendClientNotification } from '../lib/supabase'
import { ArrowLeft } from 'lucide-react'

const STATUSES = ['На рассмотрении', 'Одобрен', 'Отменён']

const STATUS_MESSAGES: Record<string, string> = {
  'Одобрен': 'Ваш спецзаказ №{requestId} одобрен! ✅ Менеджер свяжется с вами.',
  'Отменён': 'Ваш спецзаказ №{requestId} отменён ❌',
}

export default function ChinaPage() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    setLoading(true)
    const data = await getChinaRequests()
    setRequests(data)
    setLoading(false)
  }

  const handleStatusChange = async (requestId: string, newStatus: string, clientChatId: string) => {
    try {
      const updated = await updateChinaRequestStatus(requestId, newStatus)
      
      if (updated) {
        const messageTemplate = STATUS_MESSAGES[newStatus] || `Статус спецзаказа №${requestId} изменён на: ${newStatus}`
        const message = messageTemplate.replace('{requestId}', requestId)
        
        if (clientChatId) {
          const sent = await sendClientNotification(clientChatId, message)
          if (sent) {
            alert(`Статус изменён на: ${newStatus}\nУведомление отправлено клиенту ✅`)
          } else {
            alert(`Статус изменён на: ${newStatus}\n⚠️ Уведомление не отправлено`)
          }
        } else {
          alert(`Статус изменён на: ${newStatus}\n⚠️ Chat ID клиента не найден`)
        }
        
        await loadRequests()
      } else {
        alert('Ошибка при обновлении статуса')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      alert('Произошла ошибка при обновлении')
    }
  }

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(r => r.status === filter)

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
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-4"
          >
            <ArrowLeft size={20} />
            <span>На главную</span>
          </button>
          <h1 className="text-2xl font-bold">🌍 Управление спецзаказами</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white p-4 rounded-xl mb-4">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                filter === 'all' ? 'bg-black text-white' : 'bg-gray-100'
              }`}
            >
              Все ({requests.length})
            </button>
            {STATUSES.map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                  filter === status ? 'bg-black text-white' : 'bg-gray-100'
                }`}
              >
                {status} ({requests.filter(r => r.status === status).length})
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">Спецзаказ №{request.id}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(request.created_at).toLocaleString('ru-RU')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  request.status === 'На рассмотрении' ? 'bg-yellow-100 text-yellow-800' :
                  request.status === 'Одобрен' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {request.status}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">
                  📎 <strong>Ссылка/Название:</strong> {request.link}
                </p>
                {request.size_color && (
                  <p className="text-sm text-gray-600 mb-1">
                     <strong>Размер/Цвет:</strong> {request.size_color}
                  </p>
                )}
                {request.comment && (
                  <p className="text-sm text-gray-600 mb-1">
                    💬 <strong>Комментарий:</strong> {request.comment}
                  </p>
                )}
              </div>

              {request.image_url && (
                <div className="mb-4">
                  <img 
                    src={request.image_url} 
                    alt="Product" 
                    className="w-full max-w-xs rounded-lg"
                  />
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                {STATUSES.filter(s => s !== request.status).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(request.id, status, request.user_id)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}