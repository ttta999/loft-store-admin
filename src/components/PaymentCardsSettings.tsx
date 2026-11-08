import { useEffect, useState } from 'react'
import { CreditCard, Save } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'
import { dataCache } from '../lib/resourceCache'
import { parsePaymentCards, formatCardNumber, type PaymentCards, type PaymentCurrency } from '../lib/paymentCards'

export default function PaymentCardsSettings() {
  const [cards, setCards] = useState<PaymentCards | null>(() => dataCache.get('admin:payment-cards'))
  const [failed, setFailed] = useState(false)
  const [saving, setSaving] = useState(false)
  const load = async () => {
    setFailed(false)
    try {
      const value = await dataCache.load('admin:payment-cards', async () => {
        const { data, error } = await supabase.from('settings').select('value').eq('key', 'payment_cards').single()
        if (error) throw error
        return parsePaymentCards(data?.value)
      }, 60_000)
      setCards(value)
    } catch { setFailed(true) }
  }
  useEffect(() => { void load() }, [])
  const update = (currency: PaymentCurrency, field: 'number' | 'holder', value: string) => {
    setCards(previous => previous ? { ...previous, [currency]: { ...previous[currency], [field]: value } } : previous)
  }
  const save = async () => {
    let normalized: PaymentCards
    try { normalized = parsePaymentCards(cards) } catch { toast.error('Введите 16 цифр карты и имя получателя для каждой валюты'); return }
    setSaving(true)
    try {
      const { error } = await supabase.from('settings').upsert({ key: 'payment_cards', value: normalized, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      if (error) throw error
      dataCache.set('admin:payment-cards', normalized, 60_000)
      setCards(normalized)
      toast.success('Платёжные реквизиты сохранены')
    } catch { toast.error('Не удалось сохранить реквизиты') }
    finally { setSaving(false) }
  }
  return <section aria-label="Платёжные карты" className="lg:col-span-2 bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border overflow-hidden">
    <div className="flex items-center gap-3 p-5 border-b border-[#E8E2D5] dark:border-dark-border">
      <CreditCard size={20} className="text-[#1B2A4A] dark:text-gold" />
      <h2 className="text-lg font-bold text-[#1B2A4A] dark:text-white">Платёжные карты</h2>
    </div>
    <div className="p-5 space-y-4">
      <p className="text-sm text-[#8A8275] dark:text-gray-300">Реквизиты для перевода при оплате заказа в приложении.</p>
      {cards ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{(['UZS', 'USD'] as const).map(currency => <fieldset key={currency} disabled={saving} className="space-y-3">
        <legend className="font-bold text-[#1B2A4A] dark:text-white">{currency === 'UZS' ? 'Карта для оплаты в сумах' : 'Карта для оплаты в долларах'}</legend>
        <label className="block text-sm text-[#8A8275] dark:text-gray-300">Номер карты {currency}
          <input aria-label={`Номер карты ${currency}`} inputMode="numeric" autoComplete="off" value={formatCardNumber(cards[currency].number)} onChange={event => update(currency, 'number', event.target.value.replace(/\D/g, '').slice(0, 16))} className="mt-1 w-full p-3 rounded-xl border border-[#E8E2D5] dark:border-dark-border bg-white dark:bg-dark-accent text-base text-[#1B2A4A] dark:text-white" />
        </label>
        <label className="block text-sm text-[#8A8275] dark:text-gray-300">Получатель {currency}
          <input aria-label={`Получатель ${currency}`} value={cards[currency].holder} maxLength={100} onChange={event => update(currency, 'holder', event.target.value)} className="mt-1 w-full p-3 rounded-xl border border-[#E8E2D5] dark:border-dark-border bg-white dark:bg-dark-accent text-base text-[#1B2A4A] dark:text-white" />
        </label>
      </fieldset>)}</div> : <p className="text-sm text-[#8A8275] dark:text-gray-300">{failed ? 'Не удалось загрузить реквизиты' : 'Загрузка реквизитов…'}</p>}
      {failed && <button onClick={() => void load()} className="font-bold text-[#1B2A4A] dark:text-gold">Повторить загрузку</button>}
      <button onClick={() => void save()} disabled={!cards || saving} className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A] rounded-xl font-bold disabled:opacity-50"><Save size={16} />{saving ? 'Сохранение…' : 'Сохранить реквизиты'}</button>
    </div>
  </section>
}
