import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Пробуем получить курс с CBU.uz через CORS proxy
    const response = await fetch('https://cbu.uz/oz/arkhiv-kursa-valyut/json/')
    
    if (!response.ok) {
      throw new Error('CBU API не отвечает')
    }
    
    const data = await response.json()
    
    // Находим USD (обычно первый элемент)
    const usdRate = data.find((item: any) => item.Rate)
    
    if (!usdRate || !usdRate.Rate) {
      throw new Error('Курс USD не найден')
    }
    
    const rate = parseFloat(usdRate.Rate)
    
    res.status(200).json({ 
      success: true, 
      rate: rate,
      source: 'CBU.uz',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Ошибка получения курса:', error)
    
    // Fallback - возвращаем примерный курс
    res.status(200).json({ 
      success: false, 
      rate: 12100,
      source: 'fallback',
      error: 'Не удалось получить актуальный курс'
    })
  }
}