import test from 'node:test'
import assert from 'node:assert/strict'
import { confirmedRevenue, isConfirmedRevenue } from '../src/lib/revenue.ts'
test('confirmed revenue excludes unpaid, cancelled and historical unconfirmed payments',()=>{
 const paid={status:'Доставлен',payment_status:'paid',paid_at:'2026-10-31T10:00:00Z',total_price_usd:100}
 assert.equal(isConfirmedRevenue(paid),true)
 for(const change of [{payment_status:'pending'},{status:'Отменён'},{paid_at:null},{paid_at:'invalid'},{total_price_usd:-1},{total_price_usd:'invalid'}])assert.equal(isConfirmedRevenue({...paid,...change}),false)
 assert.equal(confirmedRevenue([paid,{...paid,total_price_usd:'50'},{...paid,status:'Отменён'},{...paid,payment_status:'pending'},{...paid,paid_at:null}]),150)
})
