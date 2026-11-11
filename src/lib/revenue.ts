const specialStatuses = ['Принят','Заказан у поставщика','В пути','Прибыл в страну','Собирается','Готов к выдаче','Получен','Упакован','Передан курьеру']
const revenueStatuses = new Set(['Активный', 'В обработке', 'Готов', 'Выдан', 'Доставлен', ...specialStatuses])
export const WORK_STATUSES = ['Активный', 'В обработке', 'Готов', ...specialStatuses.filter(status => status !== 'Получен')]
export function isConfirmedRevenue(order: { status?: string; payment_status?: string; paid_at?: string | null; total_price_usd?: unknown }) {
  const amount = Number(order.total_price_usd)
  return revenueStatuses.has(order.status || '') && order.payment_status === 'paid'
    && !!order.paid_at && Number.isFinite(Date.parse(order.paid_at)) && Number.isFinite(amount) && amount >= 0
}
export function confirmedRevenue(orders: Parameters<typeof isConfirmedRevenue>[0][]) {
  return orders.filter(isConfirmedRevenue).reduce((sum, order) => sum + Number(order.total_price_usd), 0)
}
