import test from 'node:test'
import assert from 'node:assert/strict'
import {createDataFetch} from '../src/lib/dataFetch.ts'
import {dataCache} from '../src/lib/resourceCache.ts'
test('a delayed Data API response from a previous manager cannot populate the current cache',async()=>{
 const original=globalThis.fetch;let scope='manager-a',finish!:(value:Response)=>void
 globalThis.fetch=async()=>new Promise(resolve=>{finish=resolve})
 try{
  const request=createDataFetch(()=>{},()=>scope)('https://fixture.supabase.co/rest/v1/orders',{headers:{Authorization:'fixture-old'}})
  await new Promise(resolve=>setImmediate(resolve));scope='manager-b';dataCache.clear()
  finish(Response.json([{customer:'old-session'}]));await assert.rejects(request,/Сессия изменилась/)
  globalThis.fetch=async()=>Response.json([{customer:'current-session'}])
  const result=await createDataFetch(()=>{},()=>scope)('https://fixture.supabase.co/rest/v1/orders',{headers:{Authorization:'fixture-new'}})
  assert.deepEqual(await result.json(),[{customer:'current-session'}])
 }finally{globalThis.fetch=original;dataCache.clear()}
})
