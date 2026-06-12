import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getChinaRequests, updateChinaRequestStatus, sendClientNotification } from '../lib/supabase'
import { ArrowLeft } from 'lucide-react'

const STATUSES = [
  { old: 'На рассмотрении', new: 'Принят 📄' },
  { old: 'Оценён', new: 'Оценён 💎' },
  { old: 'Оплачен', new: 'Оплачен ✅' },
  { old: 'Отменён клиентом', new: 'Отменён вами 🙅‍♂️' },
  { old: 'Отклонён', new: 'Отклонён 🛑' },
]

const STATUS_MESSAGES: Record<string, string> = {
  'На рассмотрении': '📄 Принят: Ваш спецзаказ №{requestId} принят! Менеджер уже изучает детали, чтобы рассчитать точную стоимость. Обычно это занимает немного времени. Скоро вернемся с ответом 🔍',
  'Оценён': '💎 Оценён: Ваш спецзаказ №{requestId} оценён в ${managerPrice}! ✨\n\nКомментарий менеджера: {managerComment}\n\nВы можете принять условия и оплатить заказ или отменить заявку. 📲',
  'Оплачен': '✅ Оплачен: Оплата спецзаказа №{requestId} успешно принята, спасибо! 🎉 Менеджер уже приступил к оформлению и подготовке!',
  'Отменён клиентом': '🙅‍♂️ Отменён вами: Заявка на спецзаказ №{requestId} отменена вами. 👋 Если вы захотите изменить параметры, вы всегда можете отправить новую заявку.',
  'Отклонён': '🛑 Отклонён: К сожалению, мы вынуждены отклонить заявку на спецзаказ №{requestId}. 😔\n\nПричина: {managerComment}\n\nПриносим извинения за неудобства. Наша поддержка всегда готова помочь вам подобрать альтернативу! ✉️',
}

export default function ChinaPage() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  
  // Модалка для оценки
  const [showPriceModal, setShowPriceModal] = useState(false)
  // Модалка для отклонения
  const [showRejectModal, setShowRejectModal] = useState(false)
  
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [managerPrice, setManagerPrice] = useState('')
  const [managerComment, setManagerComment] = useState('')
  const [rejectReason, setRejectReason] = useState('')

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
    // Если статус "Оценён" - показываем модалку для ввода цены
    if (newStatus === 'Оценён') {
      const request = requests.find(r => r.id === requestId)
      setSelectedRequest(request)
      setShowPriceModal(true)
      return
    }

    // Если статус "Отклонён" - показываем модалку для ввода причины
    if (newStatus === 'Отклонён') {
      const request = requests.find(r => r.id === requestId)
      setSelectedRequest(request)
      setShowRejectModal(true)
      return
    }

    try {
      const updated = await updateChinaRequestStatus(requestId, newStatus)
      
      if (updated) {
        const messageTemplate = STATUS_MESSAGES[newStatus] || `Статус спецзаказа №${requestId} изменён на: ${newStatus}`
        const message = messageTemplate.replace('{requestId}', requestId)
        
        console.log('Отправляем уведомление:', { clientChatId, message })
        
        if (clientChatId) {
          const sent = await sendClientNotification(clientChatId, message)
          console.log('Результат отправки:', sent)
          if (sent) {
            alert(`Статус изменён на: ${newStatus}\nУведомление отправлено клиенту ✅`)
          } else {
            alert(`Статус изменён на: ${newStatus}\n⚠️ Уведомление не отправлено (проверьте консоль)`)
          }
        } else {
          alert(`Статус изменён на: ${newStatus}\n️ Chat ID клиента не найден в базе`)
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

  const handlePriceSubmit = async () => {
    if (!managerPrice || !selectedRequest) return

    try {
      console.log('Устанавливаем цену:', { requestId: selectedRequest.id, price: managerPrice, comment: managerComment })
      
      const updated = await updateChinaRequestStatus(selectedRequest.id, 'Оценён', {
        manager_price: parseFloat(managerPrice),
        manager_comment: managerComment
      })
      
      console.log('Результат обновления:', updated)
      
      if (updated) {
        const message = STATUS_MESSAGES['Оценён']
          .replace('{requestId}', selectedRequest.id)
          .replace('{managerPrice}', managerPrice)
          .replace('{managerComment}', managerComment || 'Без комментария')
        
        console.log('Отправляем уведомление об оценке:', { userId: selectedRequest.user_id, message })
        
        if (selectedRequest.user_id) {
          const sent = await sendClientNotification(selectedRequest.user_id, message)
          console.log('Результат отправки уведомления:', sent)
          
          if (sent) {
            alert(`Цена $${managerPrice} установлена и отправлена клиенту ✅`)
          } else {
            alert(`Цена $${managerPrice} установлена\n⚠️ Уведомление не отправлено (проверьте консоль)`)
          }
        } else {
          alert(`Цена $${managerPrice} установлена\n⚠️ Chat ID клиента не найден в базе`)
        }
        
        setShowPriceModal(false)
        setManagerPrice('')
        setManagerComment('')
        await loadRequests()
      } else {
        alert('Ошибка при установке цены')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      alert('Ошибка: ' + error)
    }
  }

  const handleRejectSubmit = async () => {
    if (!selectedRequest) return

    try {
      console.log('Отклоняем спецзаказ:', { requestId: selectedRequest.id, reason: rejectReason })
      
      const updated = await updateChinaRequestStatus(selectedRequest.id, 'Отклонён', {
        manager_comment: rejectReason
      })
      
      console.log('Результат обновления:', updated)
      
      if (updated) {
        const message = STATUS_MESSAGES['Отклонён']
          .replace('{requestId}', selectedRequest.id)
          .replace('{managerComment}', rejectReason || 'Не указана')
        
        console.log('Отправляем уведомление об отклонении:', { userId: selectedRequest.user_id, message })
        
        if (selectedRequest.user_id) {
          const sent = await sendClientNotification(selectedRequest.user_id, message)
          console.log('Результат отправки уведомления:', sent)
          
          if (sent) {
            alert(`Спецзаказ отклонён и уведомление отправлено клиенту ✅`)
          } else {
            alert(`Спецзаказ отклонён\n⚠️ Уведомление не отправлено (проверьте консоль)`)
          }
        } else {
          alert(`Спецзаказ отклонён\n️ Chat ID клиента не найден в базе`)
        }
        
        setShowRejectModal(false)
        setRejectReason('')
        await loadRequests()
      } else {
        alert('Ошибка при отклонении спецзаказа')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      alert('Ошибка: ' + error)
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
            {STATUSES.map(({ old, new: newLabel }) => (
              <button
                key={old}
                onClick={() => setFilter(old)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                  filter === old ? 'bg-black text-white' : 'bg-gray-100'
                }`}
              >
                {newLabel} ({requests.filter(r => r.status === old).length})
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
                  {request.user_id && (
                    <p className="text-xs text-gray-400 mt-1">
                      Chat ID: {request.user_id}
                    </p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  request.status === 'На рассмотрении' ? 'bg-yellow-100 text-yellow-800' :
                  request.status === 'Оценён' ? 'bg-purple-100 text-purple-800' :
                  request.status === 'Оплачен' ? 'bg-green-100 text-green-800' :
                  request.status === 'Отменён клиентом' ? 'bg-orange-100 text-orange-800' :
                  request.status === 'Отклонён' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {STATUSES.find(s => s.old === request.status)?.new || request.status}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">
                   <strong>Ссылка/Название:</strong> {request.link}
                </p>
                {request.size_color && (
                  <p className="text-sm text-gray-600 mb-1">
                    📏 <strong>Размер/Цвет:</strong> {request.size_color}
                  </p>
                )}
                {request.comment && (
                  <p className="text-sm text-gray-600 mb-1">
                    💬 <strong>Комментарий клиента:</strong> {request.comment}
                  </p>
                )}
                {request.manager_price && (
                  <p className="text-sm text-purple-600 mb-1 font-medium">
                    💰 <strong>Цена менеджера:</strong> ${request.manager_price}
                  </p>
                )}
                {request.manager_comment && (
                  <p className="text-sm text-gray-600 mb-1">
                     <strong>Комментарий менеджера:</strong> {request.manager_comment}
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
                {STATUSES.filter(({ old }) => old !== request.status).map(({ old, new: newLabel }) => (
                  <button
                    key={old}
                    onClick={() => handleStatusChange(request.id, old, request.user_id)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    {newLabel}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Модалка для ввода цены */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">
              Оценить спецзаказ №{selectedRequest?.id}
            </h3>
            
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Цена в USD *
              </label>
              <input
                type="number"
                value={managerPrice}
                onChange={(e) => setManagerPrice(e.target.value)}
                placeholder="200"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Комментарий (необязательно)
              </label>
              <textarea
                value={managerComment}
                onChange={(e) => setManagerComment(e.target.value)}
                placeholder="Например: Доставка займёт 2-3 недели"
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowPriceModal(false)
                  setManagerPrice('')
                  setManagerComment('')
                }}
                className="flex-1 px-4 py-2 bg-gray-100 rounded-lg"
              >
                Отмена
              </button>
              <button
                onClick={handlePriceSubmit}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Отправить оценку
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка для отклонения с причиной */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-2 text-red-600">
              Отклонить спецзаказ №{selectedRequest?.id}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Укажите причину отклонения. Это сообщение будет отправлено клиенту.
            </p>
            
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Причина отклонения *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Например: Товар снят с производства / Не можем найти поставщика / Слишком долгая доставка"
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Минимум 5 символов
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason('')
                }}
                className="flex-1 px-4 py-2 bg-gray-100 rounded-lg"
              >
                Отмена
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={rejectReason.trim().length < 5}
                className={`flex-1 px-4 py-2 rounded-lg text-white ${
                  rejectReason.trim().length < 5 
                    ? 'bg-red-300 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Отклонить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}