import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Разрешаем CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    console.log('🔄 Получаем курс USD к UZS...')
    
    // ✅ Пробуем получить курс с CBU.uz
    const response = await fetch('https://cbu.uz/oz/arkhiv-kursa-valyut/json/', {
      headers: {
        'User-Agent': 'LOFT-Store/1.0',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`CBU API returned ${response.status}`)
    }

    const data = await response.json()
    console.log(' Данные от CBU:', JSON.stringify(data).substring(0, 200))
    
    // Ищем USD в массиве (обычно первый элемент с кодом USD)
    const usdItem = data.find((item: any) => 
      item.Ccy === 'USD' || item.code === 'USD' || item.CcyNm_UZ === 'AQSh dollari'
    )
    
    if (usdItem && usdItem.Rate) {
      const rate = parseFloat(usdItem.Rate)
      console.log('✅ Курс USD получен:', rate)
      
      return res.status(200).json({ 
        success: true, 
        rate: rate,
        source: 'CBU.uz',
        timestamp: new Date().toISOString()
      })
    }
    
    // Если не нашли USD, пробуем первый элемент
    if (data.length > 0 && data[0].Rate) {
      const rate = parseFloat(data[0].Rate)
      console.log('⚠️ Используем первый элемент:', rate)
      
      return res.status(200).json({ 
        success: true, 
        rate: rate,
        source: 'CBU.uz (first item)',
        timestamp: new Date().toISOString()
      })
    }
    
    throw new Error('Курс USD не найден в ответе CBU')

  } catch (error) {
    console.error(' Ошибка получения курса с CBU:', error)
    
    // ✅ Fallback: пробуем другой API
    try {
      console.log('🔄 Пробуем альтернативный API...')
      
      const altResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
        headers: {
          'User-Agent': 'LOFT-Store/1.0',
        },
      })
      
      if (altResponse.ok) {
        const altData = await altResponse.json()
        const rate = altData.rates?.UZS
        
        if (rate && rate > 0) {
          console.log('✅ Курс из альтернативного API:', rate)
          
          return res.status(200).json({ 
            success: true, 
            rate: rate,
            source: 'exchangerate-api.com',
            timestamp: new Date().toISOString()
          })
        }
      }
    } catch (altError) {
      console.error('❌ Альтернативный API тоже не сработал:', altError)
    }
    
    // Если ничего не сработало - возвращаем ошибку
    res.status(200).json({ 
      success: false, 
      rate: 12100,
      source: 'fallback',
      error: 'Не удалось получить актуальный курс'
    })
  }
}